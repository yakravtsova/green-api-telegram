import LoginForm from './components/LoginForm/LoginForm';
import ChatPage from './components/ChatPage/ChatPage';
import { useAuth } from './auth/AuthContext';
import styles from './App.module.css';

function App() {
  const { credentials, login } = useAuth();

  return (
    <main className={styles.app}>
      {credentials ? <ChatPage /> : <LoginForm onSubmit={login} />}
    </main>
  );
}

export default App;
