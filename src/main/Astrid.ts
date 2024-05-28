import OpenAI from 'openai';
import { Assistant } from 'openai/resources/beta/assistants';
import { Thread } from 'openai/resources/beta/threads/threads';
import { chatMessage } from '../render/components';

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
      instructions:
        'You are an exstension of the operating system on my computer. \
      Output format is JSON: {message: short answer, cmd: terminal command to run}',
      model: 'gpt-3.5-turbo',
    });
  } else {
    astrid = await openai.beta.assistants.retrieve(assistants.data[0].id);
  }

  currentThread = await openai.beta.threads.create();
};

export const sendMessage = async (message: chatMessage) => {
  await openai.beta.threads.runs.createAndPoll(currentThread.id, {
    assistant_id: astrid.id,
    additional_messages: [message],
  });
  const response = await openai.beta.threads.messages.list(currentThread.id);

  return response.data;
};
