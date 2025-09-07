import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // to prevent flicker before checking session

  // On app load, check if user is already logged in via session
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/users/me', { withCredentials: true });
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // optional: listen for global login/logout events from other components
    const handleAuthChange = () => fetchUser();
    window.addEventListener('userAuthChange', handleAuthChange);

    return () => window.removeEventListener('userAuthChange', handleAuthChange);
  }, []);

  const logout = async () => {
    try {
      await axios.post('http://localhost:8080/api/users/logout', {}, { withCredentials: true });
      setUser(null);
      window.dispatchEvent(new Event('userAuthChange')); // notify other components
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
