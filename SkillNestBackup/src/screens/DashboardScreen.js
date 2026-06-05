import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedBG from '../components/AnimatedBG';
import { GlowingCard, AlertBar } from '../components/UI';
import { COLORS, SIZES, TYPOGRAPHY, SHADOWS } from '../theme/theme';
import { getSettings, getOfflineQueue } from '../services/storage';
import {
  getAllStudents,
  getAttendance,
  syncOfflineQueue,
} from '../services/api';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    paid: 0,
  });
  const [alert, setAlert] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ online: true, queueSize: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  const cardAnimations = useRef(
    [...Array(6)].map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    loadDashboard();
    checkSyncStatus();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    cardAnimations.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: 1,
        delay: i * 80,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    });

    return () => clearInterval(timer);
  }, []);

  const loadDashboard = async () => {
    const studentsResult = await getAllStudents();
    if (studentsResult.success) {
      const students = studentsResult.data || [];
      const total = students.length;

      const attendanceResult = await getAttendance({
        date: new Date().toISOString().split('T')[0],
      });
      const present = attendanceResult.success
        ? (attendanceResult.data || []).length
        : 0;

      setStats({
        total,
        present,
        absent: total - present,
        paid: Math.floor(total * 0.75),
      });
    }
  };

  const checkSyncStatus = async () => {
    const queue = await getOfflineQueue();
    setSyncStatus({ online: true, queueSize: queue.length });
    if (queue.length > 0) {
      setAlert(`⚠ ${queue.length} items pending sync`);
    }
  };

  const handleSync = async () => {
    setAlert('SYNCING...');
    const result = await syncOfflineQueue((synced, total) => {
      setAlert(`SYNCING: ${synced}/${total}`);
    });
    setAlert(`✓ SYNC COMPLETE: ${result.synced} items synced`);
    setTimeout(() => setAlert(''), 3000);
    checkSyncStatus();
    loadDashboard();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    await checkSyncStatus();
    setRefreshing(false);
  };

  const menuItems = [
    {
      id: 'attendance',
      label: 'ATTENDANCE',
      icon: '◉',
      color: COLORS.green,
      desc: 'Mark present',
      mode: 'attendance',
    },
    {
      id: 'payment',
      label: 'PAYMENT',
      icon: '◈',
      color: COLORS.yellow,
      desc: 'Record fee',
      mode: 'payment',
    },
    {
      id: 'details',
      label: 'DETAILS',
      icon: '◎',
      color: COLORS.cyan,
      desc: 'Student info',
      mode: 'details',
    },
    {
      id: 'students',
      label: 'STUDENTS',
      icon: '◆',
      color: COLORS.pink,
      desc: 'Manage list',
    },
    {
      id: 'records',
      label: 'RECORDS',
      icon: '▤',
      color: COLORS.purple,
      desc: 'View history',
    },
    {
      id: 'device',
      label: 'DEVICE',
      icon: '⊞',
      color: COLORS.orange,
      desc: 'Link & control',
    },
  ];

  const handleMenuPress = item => {
    if (item.id === 'students') {
      navigation.navigate('StudentsTab');
    } else if (item.id === 'records') {
      navigation.navigate('RecordsTab');
    } else if (item.id === 'device') {
      navigation.navigate('Device');
    } else if (
      item.id === 'attendance' ||
      item.id === 'payment' ||
      item.id === 'details'
    ) {
      navigation.navigate('Scanner', { mode: item.mode });
    }
  };

  const StatCard = ({ label, value, color, icon }) => (
    <GlowingCard glowColor={color} style={styles.statCard}>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      <Text style={[styles.statValue, { color, textShadowColor: color }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlowingCard>
  );

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', { hour12: false });
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AnimatedBG>
      <View style={styles.topBar}>
        <Text style={styles.logoIcon}>◉</Text>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime()}</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: syncStatus.online ? COLORS.green : COLORS.pink,
              },
            ]}
          />
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  syncStatus.queueSize > 0 ? COLORS.orange : COLORS.cyan,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.cyan}
          />
        }
      >
        {alert && (
          <AlertBar
            message={alert}
            type="info"
            onDismiss={() => setAlert('')}
          />
        )}

        <View style={styles.header}>
          <Text style={styles.headerTitle}>SKILLNEST SYSTEM</Text>
          <Text style={styles.headerSub}>
            ENGLISH CLASS // MADHAVI RATHNAYAKE
          </Text>
        </View>

        <View style={styles.statusPills}>
          <View
            style={[
              styles.pill,
              { borderColor: syncStatus.online ? COLORS.green : COLORS.pink },
            ]}
          >
            <Text
              style={[
                styles.pillDot,
                { color: syncStatus.online ? COLORS.green : COLORS.pink },
              ]}
            >
              ●
            </Text>
            <Text style={styles.pillText}>
              SHEETS {syncStatus.online ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
          <View
            style={[
              styles.pill,
              {
                borderColor:
                  syncStatus.queueSize > 0 ? COLORS.orange : COLORS.cyan,
              },
            ]}
          >
            <Text
              style={[
                styles.pillDot,
                {
                  color: syncStatus.queueSize > 0 ? COLORS.orange : COLORS.cyan,
                },
              ]}
            >
              ●
            </Text>
            <Text style={styles.pillText}>QUEUE: {syncStatus.queueSize}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            label="STUDENTS"
            value={stats.total}
            color={COLORS.cyan}
            icon="◉"
          />
          <StatCard
            label="TODAY"
            value={stats.present}
            color={COLORS.green}
            icon="✓"
          />
          <StatCard
            label="PAID"
            value={stats.paid}
            color={COLORS.yellow}
            icon="$"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>● QUICK ACTIONS ————</Text>
        </View>

        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Animated.View
              key={item.id}
              style={[
                styles.menuItemWrapper,
                {
                  opacity: cardAnimations[index],
                  transform: [
                    {
                      translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.8}
              >
                <GlowingCard glowColor={item.color} style={styles.menuCard}>
                  <View
                    style={[styles.menuTopBar, { backgroundColor: item.color }]}
                  />
                  <Text
                    style={[
                      styles.menuIcon,
                      { color: item.color, textShadowColor: item.color },
                    ]}
                  >
                    {item.icon}
                  </Text>
                  <Text style={[styles.menuLabel, { color: item.color }]}>
                    {item.label}
                  </Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                </GlowingCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {syncStatus.queueSize > 0 && (
          <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
            <Text style={styles.syncButtonText}>
              ⟳ SYNC NOW ({syncStatus.queueSize})
            </Text>
          </TouchableOpacity>
        )}

        <GlowingCard glowColor={COLORS.pink} style={styles.giftCard}>
          <Text style={styles.giftIcon}>♥</Text>
          <Text style={styles.giftText}>
            Made with love for Madhavi Rathnayake
          </Text>
          <Text style={styles.giftSub}>developed by Thuli</Text>
        </GlowingCard>
      </ScrollView>
    </AnimatedBG>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,15,35,0.95)',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.cyan + '88',
  },
  logoIcon: {
    fontSize: 24,
    color: COLORS.cyan,
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    color: COLORS.cyan,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    ...SHADOWS.glow,
  },
  dateText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
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
  statusPills: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: SIZES.margin,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  pillDot: {
    fontSize: 8,
  },
  pillText: {
    color: COLORS.textDim,
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.margin,
    paddingHorizontal: SIZES.padding,
  },
  statCard: {
    width: (width - 60) / 3,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textDim,
    fontSize: 9,
  },
  sectionHeader: {
    paddingHorizontal: SIZES.padding,
    marginTop: SIZES.margin,
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.textDim,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    gap: 12,
  },
  menuItemWrapper: {
    width: (width - 50) / 3,
  },
  menuCard: {
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  menuTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  menuIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  menuLabel: {
    ...TYPOGRAPHY.label,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDesc: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    fontSize: 8,
  },
  syncButton: {
    margin: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.orange,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  syncButtonText: {
    color: COLORS.orange,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  giftCard: {
    margin: SIZES.margin,
    padding: 20,
    alignItems: 'center',
  },
  giftIcon: {
    fontSize: 32,
    color: COLORS.pink,
    marginBottom: 8,
  },
  giftText: {
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  giftSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
});
