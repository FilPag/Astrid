import { exec } from 'child_process';
import { app } from 'electron';
import { AssistantTool } from 'openai/resources/beta/assistants';
import os from 'os';
import util from 'util';

const execPromise = util.promisify(exec);

export const functions = [
  {
    type: 'function',
    function: {
      name: 'get_systsem_information',
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'runs a command in the terminal of the host machine',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'zsh command',
          },
        },
        required: ['command'],
      },
    },
  },
] as AssistantTool[];

const runCommand = async (args: string) => {
  const argObj = JSON.parse(args);

  try {
    console.log(`Executing command: \x1b[32m${argObj.command}\x1b[0m`);
    const { stdout, stderr } = await execPromise(argObj.command);
    console.log(`stdout: \x1b[33m${stdout}\x1b[0m`);
    console.log(`stderr: \x1b[31m${stderr}\x1b[0m`);

    return JSON.stringify({ stdout: stdout, stderr: stderr });
  } catch (error) {
    return JSON.stringify({ errror: error });
  }
};

const getSystemInformation = () => {
  return JSON.stringify({
    os_type: os.type(),
    os_release: os.release(),
    os_platform: os.platform(),
    cpus: os.cpus(),
    locale: app.getLocale(),
  });
};

export const handleToolCall = async (callId: string, functionName: string, args: any) => {
  switch (functionName) {
    case 'get_systsem_information':
      return {
        tool_call_id: callId,
        output: getSystemInformation(),
      };
    case 'run_command':
      const res = await runCommand(args);
      return {
        tool_call_id: callId,
        output: res,
      };
    default:
      return {
        type: 'text',
        value: 'I do not understand the tool call.',
      };
  }
};
