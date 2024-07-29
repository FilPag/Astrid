import OpenAI, { toFile } from 'openai';
import { AssistantStream } from 'openai/lib/AssistantStream';
import { AssistantStreamEvent } from 'openai/resources/beta/assistants';
import { Message, MessageDelta } from 'openai/resources/beta/threads/messages';
import { AssistantPrompt } from './AssistantPrompt';
import { functions, handleToolCall } from './functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let astrid: OpenAI.Beta.Assistant;
let currentThread: OpenAI.Beta.Thread;

const instructionString = AssistantPrompt;
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
};

const addEventListensers = (
  stream: AssistantStream,
  onCreate: (arg0: any) => void,
  onDelta: (arg0: OpenAI.Beta.Threads.Messages.MessageDelta, arg1: OpenAI.Beta.Threads.Messages.Message) => void,
  onDone: (arg0: OpenAI.Beta.Threads.Messages.Message) => void
) => {
  stream.on('messageCreated', (msg) => {
    onCreate(msg);
  });

  stream.on('messageDelta', (delta: MessageDelta, snapshot: Message) => {
    onDelta(delta, snapshot);
  });

  stream.on('messageDone', async (msg: Message) => {
    onDone(msg);
    //No need to to this since files doesn't cost anything
    /*await openai.files.del(file_ID)
    console.debug('file deleted');*/
  });

  //Handle other events
  stream.on('event', async (event: AssistantStreamEvent) => {
    if (event.event === 'thread.run.requires_action') {
      const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
      let outputs = [];
      for (const toolCall of toolCalls) {
        outputs.push(await handleToolCall(toolCall.id, toolCall.function.name, toolCall.function.arguments));
      }
      const s = openai.beta.threads.runs.submitToolOutputsStream(currentThread.id, stream.currentRun().id, {
        tool_outputs: outputs,
      });
      addEventListensers(s, onCreate, onDelta, onDone);
    }
  });
};
interface ipc_message {
  role: string;
  content: any;
}

export const sendMessage = async (
  message: ipc_message,
  onCreate: (arg0: Message) => void,
  onDelta: (arg0: MessageDelta, arg1: Message) => void,
  onDone: (arg0: Message) => void
) => {
  const content: OpenAI.Beta.Threads.Messages.MessageContentPartParam[] = [
    { type: 'text', text: message.content.message },
  ];

  if (message.content.image !== '') {
    const buffer = Buffer.from(message.content.image.split(',')[1], 'base64');
    const file = await openai.files.create({ file: await toFile(buffer, 'screenshot.png'), purpose: 'vision' });
    content.push({
      type: 'image_file',
      image_file: { file_id: file.id },
    });
  }
  const parsed_message: OpenAI.Beta.Threads.Runs.RunCreateParams.AdditionalMessage = {
    role: message.role as 'user' | 'assistant',
    content,
  };

  const stream = openai.beta.threads.runs.stream(currentThread.id, {
    assistant_id: astrid.id,
    additional_messages: [parsed_message],
    tools: functions,
  });

  addEventListensers(stream, onCreate, onDelta, onDone);
};
