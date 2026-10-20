export interface Contact {
  chatId: string;
  phone: string;
  username?: string;
}

export type MessageStatus = 'sending' | 'sent' | 'error';

export interface Message {
  /** Локальный id: idMessage от сервера появляется только после ответа на sendMessage */
  id: string;
  idMessage?: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
}

export interface Chat extends Contact {
  messages: Message[];
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  | { type: 'chatCreated'; contact: Contact }
  | { type: 'chatSelected'; chatId: string }
  | { type: 'messageSending'; chatId: string; message: Message }
  | { type: 'messageSent'; chatId: string; id: string; idMessage: string }
  | { type: 'messageFailed'; chatId: string; id: string };

export const initialChatState: ChatState = {
  chats: [],
  activeChatId: null,
};

function updateChat(state: ChatState, chatId: string, update: (chat: Chat) => Chat): ChatState {
  return {
    ...state,
    chats: state.chats.map((chat) => (chat.chatId === chatId ? update(chat) : chat)),
  };
}

function updateMessage(
  state: ChatState,
  chatId: string,
  id: string,
  update: (message: Message) => Message,
): ChatState {
  return updateChat(state, chatId, (chat) => ({
    ...chat,
    messages: chat.messages.map((message) => (message.id === id ? update(message) : message)),
  }));
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'chatCreated': {
      const { contact } = action;
      const exists = state.chats.some(({ chatId }) => chatId === contact.chatId);
      return {
        chats: exists ? state.chats : [{ ...contact, messages: [] }, ...state.chats],
        activeChatId: contact.chatId,
      };
    }
    case 'chatSelected':
      return { ...state, activeChatId: action.chatId };
    case 'messageSending':
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: [...chat.messages, action.message],
      }));
    case 'messageSent':
      return updateMessage(state, action.chatId, action.id, (message) => ({
        ...message,
        idMessage: action.idMessage,
        status: 'sent',
      }));
    case 'messageFailed':
      return updateMessage(state, action.chatId, action.id, (message) => ({
        ...message,
        status: 'error',
      }));
  }
}
