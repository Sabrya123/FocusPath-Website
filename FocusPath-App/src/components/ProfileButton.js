import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors } from '../utils/colors';
import { getCurrentUser } from '../utils/storage';
import { ProfileIcon } from './Icons';

// Profile isn't a tab — this circle in the top corner of each main screen opens
// it. Shows the user's initial, like the big avatar on the Profile screen.
export default function ProfileButton() {
  const navigation = useNavigation();
  const [initial, setInitial] = useState('');

  useFocusEffect(
    useCallback(() => {
      getCurrentUser().then((u) => setInitial(u?.name?.charAt(0)?.toUpperCase() || ''));
    }, [])
  );

  return (
    <TouchableOpacity
      style={styles.circle}
      onPress={() => navigation.navigate('Profile')}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      {initial ? (
        <Text style={styles.initial}>{initial}</Text>
      ) : (
        <ProfileIcon size={20} color="#fff" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.red,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8eaab8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  initial: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
