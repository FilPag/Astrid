import { exec } from 'child_process';
import { app, clipboard, dialog } from 'electron';
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
      name: 'writeClipBoard',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'runs a command in the terminal (' + os.platform() + ')',
      parameters: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            description: 'zsh command',
          },
          reason: {
            type: 'string',
            description: 'Short description of what the command does',
          },
        },

        required: ['command', 'reason'],
      },
    },
  },
] as AssistantTool[];

const writeClipboard = async (args: string) => {
  const argObj = JSON.parse(args);
  console.debug(`adding ${argObj.text} to clipboard`);
  await clipboard.writeText(argObj.text);
};

const runCommand = async (args: string) => {
  const argObj = JSON.parse(args);

  try {
    const response = await dialog.showMessageBox({
      title: 'Dangerous Command warning',
      type: 'warning',
      defaultId: 0,
      cancelId: 1,
      buttons: ['Continue', 'Cancel'],
      message: `Runing the command: \n${argObj.command}\nWith the reason:\n${argObj.reason}\n\nThis command could be dangerous. Are you sure you want to continue?`,
    });

    console.debug(response);

    if (response.response === 1) {
      return JSON.stringify({ stdout: '', stderr: 'Operation rejected by user' });
    }

    console.debug(`Executing command: \x1b[32m${argObj.command}\x1b[0m`);
    const { stdout, stderr } = await execPromise(argObj.command);
    console.debug(`stdout: \x1b[33m${stdout}\x1b[0m`);
    console.debug(`stderr: \x1b[31m${stderr}\x1b[0m`);

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
    case 'writeClipBoard':
      console.debug(args);
      await writeClipboard(args);
      return {
        tool_call_id: callId,
        output: 'Done',
      };
    default:
      return {
        type: 'text',
        value: 'I do not understand the tool call.',
      };
  }
};
