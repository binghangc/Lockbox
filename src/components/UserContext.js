import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = await AsyncStorage.getItem('access_token');
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await res.json();
                console.log('[UserProvider] Got profile response:', result);

                if (res.ok && result.profile) {
                    console.log('[UserProvider] Set user:', result.profile.username);
                    setUser(result.profile);
                } else {
                    console.warn('[UserContext] Invalid token or no profile:', result.error);
                    await AsyncStorage.removeItem('access_token');
                    setUser(null);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                await AsyncStorage.removeItem('access_token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user]);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
