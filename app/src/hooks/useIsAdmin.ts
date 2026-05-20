import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsAdmin(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        setIsAdmin(res.data?.user?.role === 'admin');
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, []);

  return isAdmin;
}
