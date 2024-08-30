import OpenAI, { toFile } from 'openai';
import { AssistantStream } from 'openai/lib/AssistantStream';
import { AssistantStreamEvent } from 'openai/resources/beta/assistants';
import { Message, MessageDelta } from 'openai/resources/beta/threads/messages';
import WebSocket from 'ws';
import { AssistantPrompt } from '../src/main/AssistantPrompt';
import { functions, handleToolCall } from '../src/main/functions';
import { ipc_chat_message } from '../src/render/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatLog: ipc_chat_message[] = [];

let astrid: OpenAI.Beta.Assistant;
let currentThread: OpenAI.Beta.Thread;
let currentRun: AssistantStream;
var ws: WebSocket;

const instructionString = AssistantPrompt;

const connectWebSocket = () => {
  ws = new WebSocket(`ws://localhost:${process.env.BACKEND_PORT || 3003}`);

  ws.on('open', () => {
    console.debug('Success: WebSocket connection established');
  });

  ws.on('error', (error) => {
    console.error('WebSocket connection error:', error);
    setTimeout(connectWebSocket, 2000);
  });

  ws.on('close', () => {
    console.debug('WebSocket connection closed. Retrying in 2 seconds...');
    setTimeout(connectWebSocket, 2000);
  });
};

export const init = async () => {
  const assistants = await openai.beta.assistants.list();
  if (assistants.data.length === 0) {
    astrid = await openai.beta.assistants.create({
      name: 'Astrid',
      instructions: instructionString,
      model: 'gpt-4o-mini',
    });
  } else {
    astrid = await openai.beta.assistants.retrieve(assistants.data[0].id);
  }

  const files = await openai.files.list();
  for (const file of files.data) {
    openai.files.del(file.id);
  }

  currentThread = await openai.beta.threads.create();
  connectWebSocket();
};

const processMessage = (message: Message) => {
  if (message.content.length === 0) return undefined;
  if (message.content[0].type !== 'text') return undefined;
  return { role: message.role, content: { message: message.content[0].text.value } } as ipc_chat_message;
};

const addEventListensers = (
  onCreate: (arg0: ipc_chat_message | undefined) => void,
  onDelta: (arg0: ipc_chat_message | undefined) => void,
  onDone: (arg0: ipc_chat_message | undefined) => void
) => {
  currentRun.on('abort', () => {
    const runId = currentRun.currentRun()?.id;
    if (runId) {
      openai.beta.threads.runs.cancel(currentThread.id, runId);
    }
    console.debug('Run aborted');
  });
  currentRun.on('messageCreated', (msg: Message) => {
    onCreate(processMessage(msg));
  });

  currentRun.on('messageDelta', (delta: MessageDelta, snapshot: Message) => {
    onDelta(processMessage(snapshot));
  });

  currentRun.on('messageDone', (msg: Message) => {
    const processedMsg = processMessage(msg);
    if (processedMsg) {
      chatLog.push(processedMsg);
      onDone(processedMsg);
    }
  });
  //Handle other events
  currentRun.on('event', async (event: AssistantStreamEvent) => {
    if (event.event === 'thread.run.requires_action' && event.data.required_action?.submit_tool_outputs) {
      const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
      const outputs: { tool_call_id: string; output: string }[] = [];

      for (const toolCall of toolCalls) {
        const result = await handleToolCall(toolCall.id, toolCall.function.name, toolCall.function.arguments);
        outputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(result),
        });
      }

      const currentRunId = currentRun.currentRun()?.id;
      if (currentRunId) {
        currentRun = openai.beta.threads.runs.submitToolOutputsStream(currentThread.id, currentRunId, {
          tool_outputs: outputs,
        });
        addEventListensers(onCreate, onDelta, onDone);
      } else {
        console.error('Current run ID is undefined');
      }
    }
  });
};

export const cancelRun = () => {
  if (currentRun.aborted) return;
  try {
    currentRun.abort();
  } catch (e) {
    console.error(e);
  }
};

export const getChatLog = () => {
  return chatLog;
};

export const sendMessage = async (
  message: ipc_chat_message,
  image_buffer: Buffer | undefined,
  onCreate: (arg0: ipc_chat_message | undefined) => void,
  onDelta: (arg0: ipc_chat_message | undefined) => void,
  onDone: (arg0: ipc_chat_message | undefined) => void
) => {
  const content: OpenAI.Beta.Threads.Messages.MessageContentPartParam[] = [
    { type: 'text', text: message.content.message || '' },
  ];

  if (image_buffer !== undefined) {
    const file = await openai.files.create({ file: await toFile(image_buffer, 'screenshot.png'), purpose: 'vision' });
    content.push({
      type: 'image_file',
      image_file: { file_id: file.id },
    });
  }
  const parsed_message: OpenAI.Beta.Threads.Runs.RunCreateParams.AdditionalMessage = {
    role: message.role as 'user' | 'assistant',
    content,
  };

  currentRun = openai.beta.threads.runs.stream(currentThread.id, {
    assistant_id: astrid.id,
    additional_messages: [parsed_message],
    tools: functions,
  });

  const message_copy = { ...message };
  message_copy.content.image = '';
  chatLog.push(message_copy);
  addEventListensers(onCreate, onDelta, onDone);
};
