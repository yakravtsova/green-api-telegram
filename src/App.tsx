import { useState } from 'react';
import LoginForm from './components/LoginForm/LoginForm';
import { checkInstance } from './auth/checkInstance';
import type { Credentials } from './api/types';
import styles from './App.module.css';

function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const handleLogin = async (values: Credentials) => {
    await checkInstance(values);
    setCredentials(values);
  };

  return (
    <main className={styles.app}>
      {credentials ? (
        <p>Инстанс {credentials.idInstance} авторизован</p>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </main>
  );
}

export default App;
