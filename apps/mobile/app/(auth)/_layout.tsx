import { Stack } from 'expo-router';
import { COLORS } from '@localservices/shared';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    />
  );
}
