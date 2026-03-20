import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../utils/colors';

export default function FactCard({ type, title, text }) {
  const isNegative = type === 'negative';

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: isNegative ? Colors.red : Colors.green },
      ]}
    >
      <Text style={styles.icon}>{isNegative ? '⚠️' : '✅'}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  icon: { fontSize: 28, marginBottom: 8 },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
});
