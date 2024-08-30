export interface ipc_chat_message {
  role: 'user' | 'assistant';
  content: {
    message?: string;
    image?: string;
  };
}
