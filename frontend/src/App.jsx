import { useState } from 'react';
import Auth from './Auth';
import Expenses from './Expenses';

export default function App() {
  // Page refresh pe bhi login bana rahe, isliye localStorage se padhte hain
  const [user, setUser] = useState(() => {
    try {
      return localStorage.getItem('token')
        ? JSON.parse(localStorage.getItem('user'))
        : null;
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <Auth onAuth={setUser} />;
  return <Expenses user={user} onLogout={logout} />;
}
