import { formatPhone } from '../lib/phone';
import type { Contact } from './chatReducer';

export function getChatTitle({ chatId, phone, name }: Contact): string {
  if (phone) return formatPhone(phone);
  return name || chatId;
}
