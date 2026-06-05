import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { COLORS, SIZES, TYPOGRAPHY } from '../theme/theme';

export const GlowingCard = ({ children, glowColor = COLORS.cyan, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.08)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.25,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.08,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor: glowColor + '33',
          backgroundColor: COLORS.cardBg,
          shadowOpacity: pulseAnim,
          shadowColor: glowColor,
        },
        style,
      ]}
    >
      <View style={[styles.cardTopBar, { backgroundColor: glowColor }]} />
      <View
        style={[
          styles.cornerTL,
          { borderTopColor: glowColor, borderLeftColor: glowColor },
        ]}
      />
      <View
        style={[
          styles.cornerBR,
          { borderBottomColor: glowColor, borderRightColor: glowColor },
        ]}
      />
      {children}
    </Animated.View>
  );
};

export const NeonButton = ({ onPress, label, color = COLORS.cyan, style }) => {
  const glowAnim = useRef(new Animated.Value(0.08)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.25,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.08,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.button,
          { borderColor: color, backgroundColor: color + '00' },
          { shadowOpacity: glowAnim, shadowColor: color },
          style,
        ]}
      >
        <Text style={[styles.buttonText, { color, textShadowColor: color }]}>
          [ {label} ]
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const LoadingOverlay = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.loadingOverlay}>
        <GlowingCard glowColor={COLORS.cyan} style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.cyan} />
          <Text style={styles.loadingText}>PROCESSING...</Text>
        </GlowingCard>
      </View>
    </Modal>
  );
};

export const AlertBar = ({ message, type = 'info', onDismiss }) => {
  if (!message) {
    return null;
  }

  const colors = {
    info: COLORS.cyan,
    success: COLORS.green,
    error: COLORS.pink,
    warning: COLORS.yellow,
  };

  return (
    <TouchableOpacity onPress={onDismiss} activeOpacity={0.9}>
      <View
        style={[
          styles.alertBar,
          {
            borderLeftColor: colors[type],
            backgroundColor: colors[type] + '11',
          },
        ]}
      >
        <Text style={[styles.alertText, { color: colors[type] }]}>
          ⚠ {message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: SIZES.cardBorderRadius,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
  },
  cardTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },
  cornerTL: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 14,
    height: 14,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 14,
    height: 14,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  buttonText: {
    ...TYPOGRAPHY.label,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingCard: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.label,
    color: COLORS.cyan,
    letterSpacing: 3,
    marginTop: 16,
  },
  alertBar: {
    padding: 12,
    marginHorizontal: SIZES.padding,
    marginVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  alertText: {
    ...TYPOGRAPHY.body,
    fontFamily: 'monospace',
  },
});
