import { useAuth } from '@/components/AuthContext';
import MerchantDashboard from '@/components/MerchantDashboard';
import { View } from '@/components/Themed';
import UserHome from '@/components/UserHome';
import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TabOneScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: user?.role === 'merchant' ? 'My Store' : 'MyRumah' }} />
      {user?.role === 'merchant' ? <MerchantDashboard /> : <UserHome />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
