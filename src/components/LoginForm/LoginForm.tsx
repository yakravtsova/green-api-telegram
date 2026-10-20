import { useState, type ChangeEvent, type SubmitEvent } from 'react';
import type { Credentials } from '../../api/types';
import { validateCredentials, type CredentialsErrors } from './validateCredentials';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSubmit: (credentials: Credentials) => Promise<void>;
}

const initialValues: Credentials = {
  apiUrl: 'https://api.green-api.com',
  idInstance: '',
  apiTokenInstance: '',
};

function LoginForm({ onSubmit }: LoginFormProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<CredentialsErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as keyof Credentials;
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    // Сообщение об ошибке пропадает, если пользователь начал печатать
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    const trimmed: Credentials = {
      apiUrl: values.apiUrl.trim(),
      idInstance: values.idInstance.trim(),
      apiTokenInstance: values.apiTokenInstance.trim(),
    };
    const validationErrors = validateCredentials(trimmed);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Не удалось войти');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (
    name: keyof Credentials,
    inputProps: { type?: string; inputMode?: 'numeric' } = {},
  ) => {
    const error = errors[name];
    const errorId = `${name}-error`;

    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={name}>
          {name}
        </label>
        <input
          className={error ? `${styles.input} ${styles.inputInvalid}` : styles.input}
          id={name}
          name={name}
          value={values[name]}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {error && (
          <span id={errorId} className={styles.error}>
            {error}
          </span>
        )}
      </div>
    );
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h1 className={styles.title}>Вход</h1>
      <p className={styles.hint}>
        Введите данные своего инстанса из{' '}
        <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
          личного кабинета GREEN-API
        </a>
      </p>

      {renderField('apiUrl')}
      {renderField('idInstance', { inputMode: 'numeric' })}
      {renderField('apiTokenInstance', { type: 'password' })}

      {submitError && (
        <p className={styles.submitError} role="alert">
          {submitError}
        </p>
      )}

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Проверяем…' : 'Войти'}
      </button>
    </form>
  );
}

export default LoginForm;
