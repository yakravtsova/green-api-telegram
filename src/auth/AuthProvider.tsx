import { useMemo, useState, type ReactNode } from 'react';
import type { Credentials } from '../api/types';
import { AuthContext } from './AuthContext';
import { checkInstance } from './checkInstance';
import { clearCredentials, loadCredentials, saveCredentials } from './credentialsStorage';

function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState(loadCredentials);

  const value = useMemo(
    () => ({
      credentials,
      login: async (values: Credentials) => {
        await checkInstance(values);
        saveCredentials(values);
        setCredentials(values);
      },
      logout: () => {
        clearCredentials();
        setCredentials(null);
      },
    }),
    [credentials],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
