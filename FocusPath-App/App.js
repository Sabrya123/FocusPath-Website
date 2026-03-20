import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { getCurrentUser } from './src/utils/storage';
import { Colors } from './src/utils/colors';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import IdentityScreen from './src/screens/IdentityScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const user = await getCurrentUser();
    if (!user) {
      setInitialRoute('Login');
    } else if (!user.identity) {
      setInitialRoute('Identity');
    } else {
      setInitialRoute('Dashboard');
    }
  }

  if (!initialRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.red} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.red,
          background: Colors.bg,
          card: Colors.bgCard,
          text: Colors.text,
          border: Colors.border,
          notification: Colors.red,
        },
      }}
    >
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Identity" component={IdentityScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
