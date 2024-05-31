import OpenAI from 'openai';
import { AssistantStream } from 'openai/lib/AssistantStream';
import { Assistant } from 'openai/resources/beta/assistants';
import { Message, MessageDelta } from 'openai/resources/beta/threads/messages';
import { ToolCall, ToolCallDelta } from 'openai/resources/beta/threads/runs/steps';
import { Thread } from 'openai/resources/beta/threads/threads';
import { chatMessage } from '../render/components';
import { functions, handleToolCall } from './functions';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let astrid: Assistant;
let currentThread: Thread;

export const init = async () => {
  const assistants = await openai.beta.assistants.list();
  if (assistants.data.length === 0) {
    astrid = await openai.beta.assistants.create({
      name: 'Astrid',
      instructions: 'You are an exstension of the operating system on my computer.',
      model: 'gpt-3.5-turbo',
    });
  } else {
    astrid = await openai.beta.assistants.retrieve(assistants.data[0].id);
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

  stream.on('messageDone', (msg: Message) => {
    onDone(msg);
  });

  let args = '';
  stream.on('toolCallDelta', (delta: ToolCallDelta) => {
    if (delta.type === 'function') args += delta.function.arguments;
  });

  stream.on('toolCallDone', async (toolCall: ToolCall) => {
    if (toolCall.type !== 'function') return;

    const outputs = await handleToolCall(toolCall.id, toolCall.function.name, args);
    const s = openai.beta.threads.runs.submitToolOutputsStream(currentThread.id, stream.currentRun().id, {
      tool_outputs: [outputs],
    });
    args = '';
    addEventListensers(s, onCreate, onDelta, onDone);
  });
};

export const sendMessage = async (
  message: chatMessage,
  onCreate: (arg0: Message) => void,
  onDelta: (arg0: MessageDelta, arg1: Message) => void,
  onDone: (arg0: Message) => void
) => {
  const stream = openai.beta.threads.runs.stream(currentThread.id, {
    assistant_id: astrid.id,
    additional_messages: [message],
    tools: functions,
  });

  addEventListensers(stream, onCreate, onDelta, onDone);
};
