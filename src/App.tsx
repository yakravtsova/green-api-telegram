import LoginForm from './components/LoginForm/LoginForm';
import type { Credentials } from './api/types';
import styles from './App.module.css';

function App() {
  // Instance check will be added together with the API client
  const handleLogin = (credentials: Credentials) => {
    console.log('login', credentials.idInstance);
  };

  return (
    <main className={styles.app}>
      <LoginForm onSubmit={handleLogin} />
    </main>
  );
}

export default App;
