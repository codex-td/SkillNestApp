import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import AnimatedBG from '../components/AnimatedBG';
import { LoadingOverlay, AlertBar } from '../components/UI';
import { COLORS, SIZES, TYPOGRAPHY } from '../theme/theme';
import { getAttendance, getPayments } from '../services/api';

export default function RecordsScreen() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [paymentRecords, setPaymentRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    loadRecords();
  }, [activeTab]);

  const loadRecords = async () => {
    setLoading(true);

    if (activeTab === 'attendance') {
      const result = await getAttendance();
      if (result.success) {
        setAttendanceRecords(result.data || []);
      } else {
        setAlert('Failed to load attendance records');
      }
    } else {
      const result = await getPayments();
      if (result.success) {
        setPaymentRecords(result.data || []);
      } else {
        setAlert('Failed to load payment records');
      }
    }

    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecords();
    setRefreshing(false);
  };

  const AttendanceRow = ({ record, index }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <View style={[styles.rowLeftBar, { backgroundColor: COLORS.green }]} />
      <Text style={styles.rowId}>{record.id}</Text>
      <Text style={styles.rowGrade}>{record.grade}</Text>
      <Text style={styles.rowDate}>{record.date}</Text>
      <Text style={[styles.rowStatus, { color: COLORS.green }]}>PRESENT</Text>
    </View>
  );

  const PaymentRow = ({ record, index }) => (
    <View style={[styles.row, index % 2 === 0 && styles.rowEven]}>
      <View style={[styles.rowLeftBar, { backgroundColor: COLORS.yellow }]} />
      <Text style={styles.rowId}>{record.id}</Text>
      <Text style={styles.rowMonth}>{record.month}</Text>
      <Text style={styles.rowYear}>{record.year}</Text>
      <Text style={styles.rowPaymentDate}>{record.paymentDate}</Text>
    </View>
  );

  const currentData =
    activeTab === 'attendance' ? attendanceRecords : paymentRecords;

  return (
    <AnimatedBG>
      <LoadingOverlay visible={loading} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SKILLNEST SYSTEM</Text>
          <Text style={styles.headerSub}>RECORDS ARCHIVE</Text>
        </View>

        {alert && (
          <AlertBar
            message={alert}
            type="info"
            onDismiss={() => setAlert('')}
          />
        )}

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'attendance' && styles.activeTab]}
            onPress={() => setActiveTab('attendance')}
          >
            <Text style={[styles.tabDot, { color: COLORS.green }]}>●</Text>
            <Text
              style={[
                styles.tabText,
                activeTab === 'attendance' && { color: COLORS.green },
              ]}
            >
              ATTENDANCE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'payment' && styles.activeTab]}
            onPress={() => setActiveTab('payment')}
          >
            <Text style={[styles.tabDot, { color: COLORS.yellow }]}>●</Text>
            <Text
              style={[
                styles.tabText,
                activeTab === 'payment' && { color: COLORS.yellow },
              ]}
            >
              PAYMENT
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.columnHeader}>
          <Text
            style={[
              styles.columnId,
              {
                color:
                  activeTab === 'attendance' ? COLORS.green : COLORS.yellow,
              },
            ]}
          >
            ID
          </Text>
          {activeTab === 'attendance' ? (
            <>
              <Text style={[styles.columnGrade, { color: COLORS.green }]}>
                GRADE
              </Text>
              <Text style={[styles.columnDate, { color: COLORS.green }]}>
                DATE
              </Text>
              <Text style={[styles.columnStatus, { color: COLORS.green }]}>
                STATUS
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.columnMonth, { color: COLORS.yellow }]}>
                MONTH
              </Text>
              <Text style={[styles.columnYear, { color: COLORS.yellow }]}>
                YEAR
              </Text>
              <Text
                style={[styles.columnPaymentDate, { color: COLORS.yellow }]}
              >
                DATE
              </Text>
            </>
          )}
        </View>

        <FlatList
          data={currentData}
          keyExtractor={(item, index) => `${activeTab}-${index}`}
          renderItem={({ item, index }) =>
            activeTab === 'attendance' ? (
              <AttendanceRow record={item} index={index} />
            ) : (
              <PaymentRow record={item} index={index} />
            )
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.cyan}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>NO RECORDS FOUND</Text>
          }
        />
      </View>
    </AnimatedBG>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SIZES.margin,
    marginBottom: SIZES.margin,
    borderWidth: 1,
    borderColor: COLORS.borderGlow,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0,200,255,0.05)',
  },
  tabDot: {
    fontSize: 8,
  },
  tabText: {
    color: COLORS.textDim,
    fontFamily: 'monospace',
    letterSpacing: 1,
    fontSize: 11,
  },
  columnHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: SIZES.padding,
    backgroundColor: 'rgba(0,15,35,0.9)',
    borderBottomWidth: 1.5,
  },
  columnId: {
    width: 70,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnGrade: {
    width: 70,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnDate: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnStatus: {
    width: 70,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnMonth: {
    width: 80,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnYear: {
    width: 60,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  columnPaymentDate: {
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  rowEven: {
    backgroundColor: 'rgba(0,200,255,0.02)',
  },
  rowLeftBar: {
    width: 3,
    height: 30,
    marginRight: 12,
  },
  rowId: {
    width: 70,
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  rowGrade: {
    width: 70,
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  rowDate: {
    flex: 1,
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  rowStatus: {
    width: 70,
    fontFamily: 'monospace',
    fontSize: 10,
    letterSpacing: 1,
  },
  rowMonth: {
    width: 80,
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  rowYear: {
    width: 60,
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 11,
  },
  rowPaymentDate: {
    flex: 1,
    color: COLORS.textDim,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: 40,
    fontFamily: 'monospace',
  },
});
