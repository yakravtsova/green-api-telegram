import { useState, type SubmitEvent } from 'react';
import { normalizePhone } from '../../lib/phone';
import styles from './NewChatForm.module.css';

interface NewChatFormProps {
  /** Получает номер из одних цифр. Должен отклониться с понятным текстом, если чат не создан */
  onCreate: (phone: string) => Promise<void>;
}

function NewChatForm({ onCreate }: NewChatFormProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const digits = normalizePhone(phone);
    if (!digits) {
      setError('Введите номер с кодом страны, например +7 900 123-45-67');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(digits);
      setPhone('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Не удалось создать чат');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.row}>
        <input
          className={styles.input}
          name="phone"
          type="tel"
          placeholder="Номер телефона"
          aria-label="Номер телефона"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'phone-error' : undefined}
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value);
            setError('');
          }}
        />
        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ищем…' : 'Создать чат'}
        </button>
      </div>
      {error && (
        <span id="phone-error" className={styles.error} role="alert">
          {error}
        </span>
      )}
    </form>
  );
}

export default NewChatForm;
