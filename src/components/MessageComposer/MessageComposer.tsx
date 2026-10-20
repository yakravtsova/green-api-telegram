import { useState, type KeyboardEvent, type SubmitEvent } from 'react';
import styles from './MessageComposer.module.css';

const MAX_LENGTH = 4096;

interface MessageComposerProps {
  onSend: (text: string) => void;
}

function MessageComposer({ onSend }: MessageComposerProps) {
  const [text, setText] = useState('');

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    send();
  };

  // Enter отправляет, Shift+Enter переносит строку. isComposing — ввод через IME ещё не завершён
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <textarea
        className={styles.input}
        name="message"
        rows={1}
        maxLength={MAX_LENGTH}
        placeholder="Сообщение"
        aria-label="Сообщение"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={styles.send} type="submit" disabled={!text.trim()}>
        Отправить
      </button>
    </form>
  );
}

export default MessageComposer;
