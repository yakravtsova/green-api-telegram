export interface Chat {
  chatId: string;
  phone: string;
  username?: string;
}

export interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
}

export type ChatAction =
  { type: 'chatCreated'; chat: Chat } | { type: 'chatSelected'; chatId: string };

export const initialChatState: ChatState = {
  chats: [],
  activeChatId: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'chatCreated': {
      const { chat } = action;
      const exists = state.chats.some(({ chatId }) => chatId === chat.chatId);
      return {
        chats: exists ? state.chats : [chat, ...state.chats],
        activeChatId: chat.chatId,
      };
    }
    case 'chatSelected':
      return { ...state, activeChatId: action.chatId };
  }
}
