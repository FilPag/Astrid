import { exec } from 'child_process';
import { app } from 'electron';
import { AssistantTool } from 'openai/resources/beta/assistants';
import os from 'os';

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
      description: 'runs a command in the terminal',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'zsh command to run in the terminal',
          },
        },
        required: ['command'],
      },
    },
  },
] as AssistantTool[];

const runCommand = async (args: string) => {
  const argObj = JSON.parse(args);

  const { stdout, stderr } = await exec(argObj.command);

  return JSON.stringify({
    stdout: stdout,
    strderr: stderr,
  });
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
