import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedBG from '../components/AnimatedBG';
import { GlowingCard, LoadingOverlay, AlertBar } from '../components/UI';
import { COLORS, SIZES, TYPOGRAPHY } from '../theme/theme';
import { getSettings, saveSettings, clearDevice } from '../services/storage';
import useBiometric from '../hooks/useBiometric';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [settings, setSettings] = useState({
    apiUrl: '',
    teacherName: 'Madhavi Rathnayake',
    devName: 'Thuli',
    password: '',
    fpEnabled: false,
  });
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState('');

  const { check } = useBiometric();

  useEffect(() => {
    loadSettings();
    checkBiometric();
  }, []);

  const loadSettings = async () => {
    const saved = await getSettings();
    setSettings({
      apiUrl: saved.apiUrl || '',
      teacherName: saved.teacherName || 'Madhavi Rathnayake',
      devName: saved.devName || 'Thuli',
      password: saved.password || '',
      fpEnabled: saved.fpEnabled || false,
    });
  };

  const checkBiometric = async () => {
    const bio = await check();
    setBiometricAvailable(bio.available);
  };

  const handleSave = async () => {
    setLoading(true);
    const result = await saveSettings(settings);
    if (result) {
      setAlert('Settings saved successfully');
    } else {
      setAlert('Failed to save settings');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearDevice();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <AnimatedBG>
      <LoadingOverlay visible={loading} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SKILLNEST SYSTEM</Text>
          <Text style={styles.headerSub}>CONFIGURATION</Text>
        </View>

        {alert && (
          <AlertBar
            message={alert}
            type="success"
            onDismiss={() => setAlert('')}
          />
        )}

        {/* Google Sheets API Card */}
        <GlowingCard glowColor={COLORS.cyan} style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.cyan }]}>
            GOOGLE SHEETS API
          </Text>
          <Text style={styles.inputLabel}>API URL (Apps Script Web App)</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="https://script.google.com/macros/s/.../exec"
            placeholderTextColor={COLORS.textMuted}
            value={settings.apiUrl}
            onChangeText={text => setSettings({ ...settings, apiUrl: text })}
            multiline
          />
          <Text style={styles.helperText}>
            Deploy Google Apps Script as Web App and paste URL here
          </Text>
        </GlowingCard>

        {/* Authentication Card */}
        <GlowingCard glowColor={COLORS.pink} style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.pink }]}>
            AUTHENTICATION
          </Text>

          <Text style={styles.inputLabel}>MASTER PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            value={settings.password}
            onChangeText={text => setSettings({ ...settings, password: text })}
            secureTextEntry
          />

          <View style={styles.biometricRow}>
            <View style={styles.biometricInfo}>
              <Text style={styles.biometricLabel}>BIOMETRIC LOGIN</Text>
              <Text style={styles.biometricSub}>
                {biometricAvailable
                  ? 'Available'
                  : 'Not available on this device'}
              </Text>
            </View>
            <Switch
              value={settings.fpEnabled}
              onValueChange={value =>
                setSettings({ ...settings, fpEnabled: value })
              }
              disabled={!biometricAvailable}
              trackColor={{
                false: COLORS.borderGlow,
                true: COLORS.purple + '88',
              }}
              thumbColor={
                settings.fpEnabled ? COLORS.purpleLight : COLORS.textMuted
              }
            />
          </View>

          {settings.fpEnabled && biometricAvailable && (
            <View style={styles.biometricBadge}>
              <Text style={styles.biometricBadgeText}>BIOMETRIC ENABLED</Text>
            </View>
          )}
        </GlowingCard>

        {/* App Info Card */}
        <GlowingCard glowColor={COLORS.green} style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.green }]}>
            APP INFO
          </Text>

          <Text style={styles.inputLabel}>TEACHER NAME</Text>
          <TextInput
            style={styles.input}
            value={settings.teacherName}
            onChangeText={text =>
              setSettings({ ...settings, teacherName: text })
            }
          />

          <Text style={styles.inputLabel}>DEVELOPER NAME</Text>
          <TextInput
            style={styles.input}
            value={settings.devName}
            onChangeText={text => setSettings({ ...settings, devName: text })}
          />
        </GlowingCard>

        {/* Save Button */}
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>SAVE ALL SETTINGS</Text>
        </TouchableOpacity>

        {/* About Card */}
        <GlowingCard glowColor={COLORS.pink} style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.pink }]}>ABOUT</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>APP</Text>
            <Text style={styles.aboutValue}>SkillNest QR Attendance</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>VERSION</Text>
            <Text style={styles.aboutValue}>5.0.0</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>FOR</Text>
            <Text style={styles.aboutValue}>Madhavi Rathnayake</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>DEV BY</Text>
            <Text style={styles.aboutValue}>Thuli</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>STACK</Text>
            <Text style={styles.aboutValue}>React Native</Text>
          </View>

          <View style={styles.giftBox}>
            <Text style={styles.giftText}>
              ♥ Made with love for Madhavi Rathnayake
            </Text>
          </View>
        </GlowingCard>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </ScrollView>
    </AnimatedBG>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    padding: SIZES.padding,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.cyan,
    fontSize: 22,
  },
  headerSub: {
    ...TYPOGRAPHY.label,
    color: COLORS.textDim,
    marginTop: 4,
  },
  card: {
    margin: SIZES.margin,
    padding: 20,
  },
  cardTitle: {
    ...TYPOGRAPHY.label,
    fontSize: 14,
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  helperText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 8,
  },
  biometricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  biometricInfo: {
    flex: 1,
  },
  biometricLabel: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  biometricSub: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 2,
  },
  biometricBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  biometricBadgeText: {
    color: COLORS.purpleLight,
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 1,
  },
  saveButton: {
    margin: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.cyan,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  aboutLabel: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  aboutValue: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  giftBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.pink + '11',
    borderRadius: 8,
    alignItems: 'center',
  },
  giftText: {
    color: COLORS.pink,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  logoutButton: {
    margin: SIZES.margin,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: COLORS.pink,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.pink,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
});
