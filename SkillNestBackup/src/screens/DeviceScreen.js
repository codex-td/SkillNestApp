import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AnimatedBG from '../components/AnimatedBG';
import { GlowingCard, LoadingOverlay, AlertBar } from '../components/UI';
import { COLORS, SIZES, TYPOGRAPHY } from '../theme/theme';
import { saveDevice, loadDevice, clearDevice } from '../services/storage';

export default function DeviceScreen() {
  const [deviceIp, setDeviceIp] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    const device = await loadDevice();
    setDeviceIp(device.ip);
    setDeviceName(device.name);
    setLinked(device.linked);
  };

  const handleLink = async () => {
    if (!deviceIp) {
      setAlert('Enter device IP address');
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      await saveDevice({
        ip: deviceIp,
        name: deviceName || 'Scanner Device',
        linked: true,
      });
      setLinked(true);
      setAlert('Device linked successfully');
      setLoading(false);
    }, 1500);
  };

  const handleUnlink = async () => {
    await clearDevice();
    setLinked(false);
    setDeviceIp('');
    setDeviceName('');
    setAlert('Device unlinked');
  };

  const commands = [
    { label: 'ATTENDANCE MODE', cmd: 'attendance', color: COLORS.green },
    { label: 'PAYMENT MODE', cmd: 'payment', color: COLORS.yellow },
    { label: 'DETAILS MODE', cmd: 'details', color: COLORS.cyan },
    { label: 'START SCAN', cmd: 'start', color: COLORS.cyan },
    { label: 'STOP SCAN', cmd: 'stop', color: COLORS.pink },
    { label: 'SYNC NOW', cmd: 'sync', color: COLORS.orange },
    { label: 'RESTART', cmd: 'restart', color: COLORS.pink },
  ];

  const sendCommand = async command => {
    if (!linked) {
      setAlert('Please link a device first');
      return;
    }
    setAlert(`Command sent: ${command}`);
    setTimeout(() => setAlert(''), 2000);
  };

  return (
    <AnimatedBG>
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SKILLNEST SYSTEM</Text>
          <Text style={styles.headerSub}>DEVICE MANAGEMENT</Text>
        </View>
        {alert && (
          <AlertBar
            message={alert}
            type="info"
            onDismiss={() => setAlert('')}
          />
        )}

        <GlowingCard glowColor={COLORS.cyan} style={styles.card}>
          <Text style={[styles.cardTitle, { color: COLORS.cyan }]}>
            CONNECTION
          </Text>
          <Text style={styles.inputLabel}>DEVICE IP ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="192.168.1.100"
            placeholderTextColor={COLORS.textMuted}
            value={deviceIp}
            onChangeText={setDeviceIp}
            editable={!linked}
          />
          <Text style={styles.inputLabel}>DEVICE NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Scanner Device"
            placeholderTextColor={COLORS.textMuted}
            value={deviceName}
            onChangeText={setDeviceName}
            editable={!linked}
          />
          <Text style={styles.helperText}>
            Ensure device is on same WiFi network
          </Text>
          <View style={styles.buttonRow}>
            {!linked ? (
              <TouchableOpacity
                onPress={handleLink}
                style={[styles.button, { borderColor: COLORS.cyan }]}
              >
                <Text style={[styles.buttonText, { color: COLORS.cyan }]}>
                  LINK DEVICE
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleUnlink}
                style={[styles.button, { borderColor: COLORS.pink }]}
              >
                <Text style={[styles.buttonText, { color: COLORS.pink }]}>
                  UNLINK DEVICE
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </GlowingCard>

        {linked && (
          <GlowingCard glowColor={COLORS.green} style={styles.card}>
            <View style={styles.statusHeader}>
              <Text style={[styles.cardTitle, { color: COLORS.green }]}>
                STATUS
              </Text>
              <TouchableOpacity onPress={loadDeviceInfo}>
                <Text style={styles.refreshText}>⟳</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>STATUS</Text>
              <Text style={[styles.statusValue, { color: COLORS.green }]}>
                ONLINE
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>IP ADDRESS</Text>
              <Text style={styles.statusValue}>{deviceIp}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>DEVICE NAME</Text>
              <Text style={styles.statusValue}>
                {deviceName || 'Scanner Device'}
              </Text>
            </View>
          </GlowingCard>
        )}

        {linked && (
          <GlowingCard glowColor={COLORS.purple} style={styles.card}>
            <Text style={[styles.cardTitle, { color: COLORS.purple }]}>
              REMOTE CONTROL
            </Text>
            <View style={styles.commandGrid}>
              {commands.map(cmd => (
                <TouchableOpacity
                  key={cmd.cmd}
                  onPress={() => sendCommand(cmd.cmd)}
                  style={[styles.commandButton, { borderColor: cmd.color }]}
                >
                  <Text style={[styles.commandText, { color: cmd.color }]}>
                    {cmd.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.helperText}>
              Commands are sent to linked device
            </Text>
          </GlowingCard>
        )}
      </ScrollView>
    </AnimatedBG>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 40 },
  header: { padding: SIZES.padding, alignItems: 'center' },
  headerTitle: { ...TYPOGRAPHY.title, color: COLORS.cyan, fontSize: 22 },
  headerSub: { ...TYPOGRAPHY.label, color: COLORS.textDim, marginTop: 4 },
  card: { margin: SIZES.margin, padding: 20 },
  cardTitle: { ...TYPOGRAPHY.label, fontSize: 14, marginBottom: 16 },
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
  helperText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    fontSize: 9,
    marginTop: 8,
  },
  buttonRow: { marginTop: 16, alignItems: 'center' },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  buttonText: { fontFamily: 'monospace', letterSpacing: 1 },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshText: { color: COLORS.textDim, fontSize: 18 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  statusLabel: { color: COLORS.textDim, fontFamily: 'monospace', fontSize: 11 },
  statusValue: { color: COLORS.text, fontFamily: 'monospace', fontSize: 11 },
  commandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  commandButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '48%',
    alignItems: 'center',
  },
  commandText: { fontFamily: 'monospace', fontSize: 10, letterSpacing: 1 },
});
