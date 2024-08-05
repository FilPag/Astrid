export interface ipc_chat_message {
  role: string;
  content: {
    message: string;
    image?: string;
  };
}
