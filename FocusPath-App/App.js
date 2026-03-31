import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { getCurrentUser } from './src/utils/storage';
import { Colors } from './src/utils/colors';

import { HomeIcon, TimelineIcon, EmergencyIcon, FriendsIcon, ProfileIcon } from './src/components/Icons';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import IdentityScreen from './src/screens/IdentityScreen';
import HomeTab from './src/screens/HomeTab';
import TimelineTab from './src/screens/TimelineTab';
import EmergencyTab from './src/screens/EmergencyTab';
import FriendsTab from './src/screens/FriendsTab';
import ProfileTab from './src/screens/ProfileTab';
import AddHabitScreen from './src/screens/AddHabitScreen';
import HabitSessionScreen from './src/screens/HabitSessionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const color = focused ? Colors.red : Colors.textMuted;
  const iconMap = {
    Home: <HomeIcon size={24} color={color} focused={focused} />,
    Timeline: <TimelineIcon size={24} color={color} focused={focused} />,
    Emergency: <EmergencyIcon size={28} color={color} focused={focused} />,
    Friends: <FriendsIcon size={24} color={color} focused={focused} />,
    Profile: <ProfileIcon size={24} color={color} focused={focused} />,
  };
  return (
    <View style={styles.tabIconWrap}>
      {label === 'Emergency' ? (
        <View style={[styles.emergencyTabBtn, focused && styles.emergencyTabBtnActive]}>
          {iconMap[label]}
        </View>
      ) : (
        iconMap[label]
      )}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.red,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeTab} />
      <Tab.Screen name="Timeline" component={TimelineTab} />
      <Tab.Screen
        name="Emergency"
        component={EmergencyTab}
        options={{ tabBarLabel: () => null }}
      />
      <Tab.Screen name="Friends" component={FriendsTab} />
      <Tab.Screen name="Profile" component={ProfileTab} />
    </Tab.Navigator>
  );
}

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
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: false,
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
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Identity" component={IdentityScreen} />
        <Stack.Screen name="Dashboard" component={MainTabs} />
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="HabitSession"
          component={HabitSessionScreen}
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
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
  tabBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: Colors.bgCard,
    borderTopWidth: 0,
    borderRadius: 30,
    height: 60,
    paddingBottom: 0,
    paddingTop: 0,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#8eaab8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 22,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  emergencyTabBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.redDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emergencyTabBtnActive: {
    backgroundColor: Colors.red,
    shadowOpacity: 0.5,
  },
  emergencyTabIcon: {
    fontSize: 24,
  },
});
