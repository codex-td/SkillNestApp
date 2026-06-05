import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
  Dimensions,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RNCamera } from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AnimatedBG from '../components/AnimatedBG';
import { GlowingCard, LoadingOverlay } from '../components/UI';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import {
  markAttendance,
  recordPayment,
  getStudentDetails,
} from '../services/api';

const { width, height } = Dimensions.get('window');

export default function ScannerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode } = route.params || { mode: 'attendance' };

  const [scanned, setScanned] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(mode === 'payment');
  const [hasPermission, setHasPermission] = useState(null);

  const scanLineAnim = useRef(new Animated.Value(-100)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const scannerRef = useRef(null);

  const modeColors = {
    attendance: COLORS.green,
    payment: COLORS.yellow,
    details: COLORS.cyan,
  };

  const modeLabels = {
    attendance: 'ATTENDANCE SCAN',
    payment: 'PAYMENT SCAN',
    details: 'DETAILS SCAN',
  };

  useEffect(() => {
    requestCameraPermission();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 100,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: -100,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await RNCamera.requestCameraPermissions();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || loading) {
      return;
    }

    setScanned(true);
    Vibration.vibrate(100);
    setLoading(true);

    try {
      let result;
      const studentId = data.trim();

      if (mode === 'attendance') {
        result = await markAttendance(studentId);
      } else if (mode === 'payment') {
        result = await recordPayment(
          studentId,
          selectedMonth + 1,
          selectedYear,
        );
      } else {
        result = await getStudentDetails(studentId);
      }

      if (result.success) {
        setScanResult({
          success: true,
          studentId,
          data: result.data,
          mode,
        });
        Animated.spring(resultAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      } else {
        setScanResult({
          success: false,
          error: result.error,
          studentId,
        });
        Animated.spring(resultAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      setScanResult({
        success: false,
        error: error.message,
        studentId: data,
      });
      Animated.spring(resultAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanResult(null);
    resultAnim.setValue(0);
    if (scannerRef.current) {
      scannerRef.current.reactivate();
    }
  };

  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  if (hasPermission === null) {
    return (
      <AnimatedBG>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>
            Requesting camera permission...
          </Text>
        </View>
      </AnimatedBG>
    );
  }

  if (hasPermission === false) {
    return (
      <AnimatedBG>
        <View style={styles.centerContainer}>
          <Text style={styles.permissionText}>Camera permission required</Text>
          <TouchableOpacity
            onPress={requestCameraPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonText}>GRANT ACCESS</Text>
          </TouchableOpacity>
        </View>
      </AnimatedBG>
    );
  }

  return (
    <AnimatedBG>
      <LoadingOverlay visible={loading} />

      {/* Month Picker for Payment Mode */}
      <Modal
        visible={showMonthPicker && mode === 'payment'}
        transparent
        animationType="fade"
      >
        <View style={styles.monthPickerOverlay}>
          <GlowingCard glowColor={COLORS.yellow} style={styles.monthPickerCard}>
            <Text style={styles.monthPickerTitle}>SELECT MONTH</Text>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <View style={styles.monthGrid}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedMonth(index);
                    setShowMonthPicker(false);
                  }}
                >
                  <View
                    style={[
                      styles.monthButton,
                      selectedMonth === index && { borderColor: COLORS.yellow },
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthButtonText,
                        selectedMonth === index && { color: COLORS.yellow },
                      ]}
                    >
                      {month}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
          </GlowingCard>
        </View>
      </Modal>

      {/* QR Scanner */}
      <QRCodeScanner
        ref={scannerRef}
        onRead={handleBarCodeScanned}
        flashMode={RNCamera.Constants.FlashMode.off}
        topContent={
          <View style={styles.topBar}>
            <Text style={[styles.modeLabel, { color: modeColors[mode] }]}>
              {modeLabels[mode]}
            </Text>
            {mode === 'payment' && (
              <Text style={styles.monthLabel}>
                {months[selectedMonth]} {selectedYear}
              </Text>
            )}
          </View>
        }
        bottomContent={
          <View style={styles.bottomContent}>
            <Text style={[styles.instructionText, { color: modeColors[mode] }]}>
              PLACE QR IN FRAME
            </Text>
            <View
              style={[
                styles.instructionLine,
                { backgroundColor: modeColors[mode] },
              ]}
            />
          </View>
        }
        cameraStyle={styles.camera}
        customMarker={
          <View style={styles.scanFrameContainer}>
            <View style={styles.scanFrame}>
              <View
                style={[styles.cornerTL, { borderColor: modeColors[mode] }]}
              />
              <View
                style={[styles.cornerTR, { borderColor: modeColors[mode] }]}
              />
              <View
                style={[styles.cornerBL, { borderColor: modeColors[mode] }]}
              />
              <View
                style={[styles.cornerBR, { borderColor: modeColors[mode] }]}
              />
              <View
                style={[
                  styles.innerRect,
                  { borderColor: modeColors[mode] + '55' },
                ]}
              />
              <View
                style={[
                  styles.crosshairH,
                  { backgroundColor: modeColors[mode] + '55' },
                ]}
              />
              <View
                style={[
                  styles.crosshairV,
                  { backgroundColor: modeColors[mode] + '55' },
                ]}
              />
              <View
                style={[
                  styles.centerDot,
                  { backgroundColor: modeColors[mode] },
                ]}
              />
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    backgroundColor: modeColors[mode],
                    transform: [{ translateY: scanLineAnim }],
                    shadowColor: modeColors[mode],
                  },
                ]}
              />
            </View>
          </View>
        }
      />

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <View style={styles.backButtonInner}>
          <Text style={styles.backButtonText}>[ BACK ]</Text>
        </View>
      </TouchableOpacity>

      {/* Result Panel */}
      {scanResult && (
        <Animated.View
          style={[
            styles.resultPanel,
            {
              transform: [
                {
                  translateY: resultAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                },
              ],
              opacity: resultAnim,
            },
          ]}
        >
          <GlowingCard
            glowColor={scanResult.success ? modeColors[mode] : COLORS.pink}
            style={styles.resultCard}
          >
            <Text
              style={[
                styles.resultStatus,
                { color: scanResult.success ? modeColors[mode] : COLORS.pink },
              ]}
            >
              {scanResult.success ? '▶ VERIFIED' : `✕ ${scanResult.error}`}
            </Text>

            <Text style={styles.resultId}>{scanResult.studentId}</Text>

            {scanResult.success && scanResult.data && (
              <>
                <Text style={styles.resultName}>{scanResult.data.name}</Text>
                {mode === 'payment' && (
                  <Text style={styles.resultMonth}>
                    {months[selectedMonth]} {selectedYear}
                  </Text>
                )}

                {mode === 'details' && scanResult.data && (
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>PHONE</Text>
                      <Text style={styles.detailValue}>
                        {scanResult.data.phone || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>GENDER</Text>
                      <Text style={styles.detailValue}>
                        {scanResult.data.gender || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>GRADE</Text>
                      <Text style={styles.detailValue}>
                        {scanResult.data.grade || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>EMAIL</Text>
                      <Text style={styles.detailValue}>
                        {scanResult.data.email || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>PARENT</Text>
                      <Text style={styles.detailValue}>
                        {scanResult.data.parent || 'N/A'}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            <View style={styles.resultButtons}>
              <TouchableOpacity
                onPress={resetScanner}
                style={styles.resultButton}
              >
                <Text
                  style={[styles.resultButtonText, { color: modeColors[mode] }]}
                >
                  SCAN AGAIN
                </Text>
              </TouchableOpacity>
              {mode === 'payment' && (
                <TouchableOpacity
                  onPress={() => setShowMonthPicker(true)}
                  style={styles.resultButton}
                >
                  <Text
                    style={[styles.resultButtonText, { color: COLORS.yellow }]}
                  >
                    CHANGE MONTH
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.resultButton}
              >
                <Text
                  style={[styles.resultButtonText, { color: COLORS.textDim }]}
                >
                  BACK TO MENU
                </Text>
              </TouchableOpacity>
            </View>
          </GlowingCard>
        </Animated.View>
      )}
    </AnimatedBG>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: COLORS.text,
    fontFamily: 'monospace',
    marginBottom: 20,
  },
  permissionButton: {
    borderWidth: 1,
    borderColor: COLORS.cyan,
    padding: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: COLORS.cyan,
    fontFamily: 'monospace',
  },
  topBar: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modeLabel: {
    fontSize: 14,
    fontFamily: 'monospace',
    letterSpacing: 2,
    ...SHADOWS.glow,
  },
  monthLabel: {
    color: COLORS.yellow,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  bottomContent: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  camera: {
    flex: 1,
  },
  scanFrameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  innerRect: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    borderWidth: 1,
  },
  crosshairH: {
    position: 'absolute',
    width: 40,
    height: 1,
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: 40,
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scanLine: {
    position: 'absolute',
    width: 200,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 1,
  },
  instructionText: {
    fontFamily: 'monospace',
    letterSpacing: 2,
    fontSize: 12,
  },
  instructionLine: {
    width: 100,
    height: 1,
    marginTop: 8,
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  backButtonInner: {
    backgroundColor: 'rgba(0,15,35,0.8)',
    borderTopWidth: 1,
    borderTopColor: COLORS.cyan,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  monthPickerOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerCard: {
    width: width - 40,
    padding: 20,
    alignItems: 'center',
  },
  monthPickerTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.yellow,
    marginBottom: 12,
  },
  yearText: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  monthButton: {
    width: 70,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 8,
    alignItems: 'center',
  },
  monthButtonText: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
  },
  cancelText: {
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 12,
  },
  resultPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  resultCard: {
    margin: SIZES.margin,
    padding: 20,
  },
  resultStatus: {
    ...TYPOGRAPHY.label,
    textAlign: 'center',
    marginBottom: 12,
  },
  resultId: {
    ...TYPOGRAPHY.title,
    fontSize: 20,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultMonth: {
    color: COLORS.yellow,
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsGrid: {
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGlow,
  },
  detailLabel: {
    width: 80,
    color: COLORS.cyan,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  detailValue: {
    flex: 1,
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  resultButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  resultButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 6,
  },
  resultButtonText: {
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
});
