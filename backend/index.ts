import cors from 'cors';
import express, { Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import WebSocket from 'ws';
import * as Astrid from '../src/main/Astrid';
import { ipc_chat_message } from '../src/render/types';

const app = express();
const port = process.env.BACKEND_PORT || 3003;

app.use(cors());
app.use(express.json());

// Create HTTP server
const server = new HttpServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  ws.on('message', async (message: string) => {
    try {
      const data: ipc_chat_message = JSON.parse(message);

      // Use Astrid to process the message
      await Astrid.sendMessage(
        data,
        data.content.image ? Buffer.from(data.content.image) : undefined,
        (msg) => ws.send(JSON.stringify(msg)), // onCreate
        (msg) => ws.send(JSON.stringify(msg)), // onDelta
        (msg) => ws.send(JSON.stringify(msg)) // onDone
      );
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      ws.send(JSON.stringify({ error: 'Internal server error' }));
    }
  });
});

// Keep the existing HTTP endpoint
app.post('/chat', async (req: Request<{}, {}, ipc_chat_message>, res: Response) => {
  try {
    const message = req.body;

    // Use Astrid to process the message
    let finalResponse: ipc_chat_message;
    await Astrid.sendMessage(
      message,
      undefined, // No image buffer for now
      () => {}, // onCreate (not used for HTTP)
      () => {}, // onDelta (not used for HTTP)
      (msg) => {
        finalResponse = msg;
      } // onDone
    );

    res.json(finalResponse);
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

server.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});

// Initialize Astrid when the server starts
Astrid.init().catch(console.error);
