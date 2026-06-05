import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedBG from '../components/AnimatedBG';
import { GlowingCard, LoadingOverlay } from '../components/UI';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import { getSettings, saveSettings } from '../services/storage';
import useBiometric from '../hooks/useBiometric';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [fpEnabled, setFpEnabled] = useState(false);

  const { check, authenticate } = useBiometric();

  const cardTranslateY = useRef(new Animated.Value(80)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.93)).current;
  const fpPulse = useRef(new Animated.Value(1)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Card entrance animation
    Animated.parallel([
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.08,
          duration: 2800,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 0.93,
          duration: 2800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Fingerprint button pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(fpPulse, {
          toValue: 1.12,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(fpPulse, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Spinning ring animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      }),
    ).start();

    // Check biometric availability
    const initBiometric = async () => {
      const bio = await check();
      const settings = await getSettings();
      setBiometricAvailable(bio.available);
      setFpEnabled(settings.fpEnabled);

      if (bio.available && settings.fpEnabled) {
        setTimeout(() => handleBiometricLogin(), 800);
      }
    };
    initBiometric();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = async () => {
    setError('');
    const settings = await getSettings();

    if (!settings.password) {
      // First time setup
      if (password.length >= 4) {
        await saveSettings({ password });
        navigation.replace('Main');
      } else {
        setError('SETUP: Enter at least 4 characters as master password');
      }
      return;
    }

    if (password === settings.password) {
      navigation.replace('Main');
    } else {
      setError('ACCESS DENIED // Invalid authorization code');
      setPassword('');
    }
  };

  const handleBiometricLogin = async () => {
    const settings = await getSettings();
    if (!settings.fpEnabled) {
      return;
    }

    const result = await authenticate('Verify identity to access SkillNest');
    if (result.success) {
      navigation.replace('Main');
    } else {
      setError('BIOMETRIC AUTH FAILED');
    }
  };

  return (
    <AnimatedBG>
      <View style={styles.container}>
        <LoadingOverlay visible={loading} />

        <Animated.View
          style={[
            styles.cardWrapper,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }],
            },
          ]}
        >
          <GlowingCard glowColor={COLORS.cyan} style={styles.card}>
            {/* Spinning ring with dots */}
            <Animated.View
              style={[styles.spinningRing, { transform: [{ rotate: spin }] }]}
            >
              {[0, 1, 2, 3, 4, 5].map(i => (
                <View
                  key={i}
                  style={[
                    styles.ringDot,
                    { transform: [{ rotate: `${i * 60}deg` }] },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Logo */}
            <View style={styles.logoRingOuter}>
              <View style={styles.logoRingInner}>
                <Animated.View
                  style={[
                    styles.logoPlaceholder,
                    { transform: [{ scale: logoScale }] },
                  ]}
                >
                  <Text style={styles.logoText}>◉</Text>
                </Animated.View>
              </View>
            </View>

            <Text style={styles.title}>SKILLNEST</Text>
            <View style={styles.decorativeLine}>
              <View style={styles.dot} />
              <View style={styles.line} />
              <View style={styles.dot} />
            </View>
            <Text style={styles.subtitle}>ENGLISH CLASS MANAGEMENT SYSTEM</Text>
            <Text style={styles.teacherName}>♥ FOR: MADHAVI RATHNAYAKE</Text>

            <View style={styles.authBox}>
              <View style={styles.innerCornerTL} />
              <View style={styles.innerCornerBR} />

              <Text style={styles.systemLabel}>[ SYSTEM ACCESS ]</Text>

              <Text style={styles.inputLabel}>AUTHORIZATION CODE</Text>
              <View style={styles.passwordContainer}>
                <View
                  style={[
                    styles.passwordLeftBar,
                    { backgroundColor: COLORS.cyan },
                  ]}
                />
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  autoFocus
                />
              </View>

              {error && (
                <View style={styles.errorBox}>
                  <View style={styles.errorLeftBar} />
                  <Text style={styles.errorText}>✕ {error}</Text>
                </View>
              )}

              <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
                <View style={styles.loginButton}>
                  <Text style={styles.loginButtonText}>▶ ENTER SYSTEM</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.orDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {biometricAvailable && fpEnabled && (
                <Animated.View style={{ transform: [{ scale: fpPulse }] }}>
                  <TouchableOpacity onPress={handleBiometricLogin}>
                    <View style={styles.biometricButton}>
                      <Text style={styles.biometricText}>⬡ FINGERPRINT</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>

            <Text style={styles.footer}>v5.0 ◆ SkillNest ◆ dev: Thuli</Text>
          </GlowingCard>
        </Animated.View>
      </View>
    </AnimatedBG>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: SIZES.padding * 2,
    alignItems: 'center',
    overflow: 'hidden',
  },
  spinningRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: 40,
  },
  ringDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
    top: 56,
    left: 56,
  },
  logoRingOuter: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  logoRingInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cyanDeep + '33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cyan + '55',
  },
  logoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.cyanDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    color: COLORS.cyan,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.cyan,
    ...SHADOWS.glow,
    marginTop: 20,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.cyan,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.cyan,
    marginHorizontal: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textDim,
    marginBottom: 8,
  },
  teacherName: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  authBox: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 12,
    position: 'relative',
    marginBottom: 16,
  },
  innerCornerTL: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.textDim,
  },
  innerCornerBR: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 8,
    height: 8,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.textDim,
  },
  systemLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  passwordLeftBar: {
    width: 3,
    height: 44,
    marginRight: 12,
  },
  passwordInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: COLORS.text,
    fontSize: 20,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pink + '22',
    borderWidth: 1,
    borderColor: COLORS.pink + '55',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorLeftBar: {
    width: 3,
    height: 20,
    backgroundColor: COLORS.pink,
    marginRight: 12,
  },
  errorText: {
    color: COLORS.pink,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: COLORS.cyan,
    fontFamily: 'monospace',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.borderGlow,
  },
  orText: {
    color: COLORS.textMuted,
    paddingHorizontal: 12,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  biometricButton: {
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.purple + '22',
  },
  biometricText: {
    color: COLORS.purpleLight,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  footer: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    marginTop: 16,
  },
});
