import styles from './LoginForm.module.css';

function LoginForm() {
  return (
    <form className={styles.form}>
      <h1 className={styles.title}>Вход</h1>
      <p className={styles.hint}>
        Введите данные своего инстанса из{' '}
        <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
          личного кабинета GREEN-API
        </a>
      </p>

      <label className={styles.field}>
        <span className={styles.label}>apiUrl</span>
        <input className={styles.input} name="apiUrl" defaultValue="https://api.green-api.com" />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>idInstance</span>
        <input className={styles.input} name="idInstance" inputMode="numeric" />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>apiTokenInstance</span>
        <input className={styles.input} name="apiTokenInstance" type="password" />
      </label>

      <button className={styles.button} type="submit">
        Войти
      </button>
    </form>
  );
}

export default LoginForm;
