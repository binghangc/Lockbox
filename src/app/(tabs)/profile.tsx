import { Text, View, Button, StyleSheet } from 'react-native';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            console.log('User logged out successfully');
            router.replace('/(auth)/login');
        }
    };

    return (
        <View style={styles.container}>
            <Text>Profile</Text>
            <Button title="Log Out" onPress={handleLogout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#222',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
  