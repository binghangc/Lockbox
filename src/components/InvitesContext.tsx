import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/components/UserContext';
import { Invite } from '@/types';

const InvitesContext = createContext<{
  invites: Invite[];
  refreshInvites: () => void;
}>({
  invites: [],
  refreshInvites: () => {},
});

export function InvitesProvider({ children }: { children: React.ReactNode }) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const { user } = useUser();

  const listInvites = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/invites`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setInvites(data);
      } else {
        const { error } = await res.json();
        console.error('Error fetching invites:', error);
      }
    } catch (error) {
      console.error('Invites error:', error);
    }
  };

  useEffect(() => {
    if (user) {
      listInvites();
    } else {
      setInvites([]);
    }
  }, [user]);

  const value = useMemo(
    () => ({ invites, refreshInvites: listInvites }),
    [invites],
  );

  return (
    <InvitesContext.Provider value={value}>{children}</InvitesContext.Provider>
  );
}

export const useInvites = () => {
  const context = useContext(InvitesContext);
  if (!context) {
    throw new Error('useInvites must be used within an Invites Provider');
  }
  return context;
};
