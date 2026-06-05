import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { COLORS } from '../theme/theme';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import StudentsScreen from '../screens/StudentsScreen';
import RecordsScreen from '../screens/RecordsScreen';
import DeviceScreen from '../screens/DeviceScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, label, iconName, color }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Icon
        name={iconName}
        size={24}
        color={focused ? color : COLORS.textMuted}
      />
      <Text
        style={[styles.tabLabel, { color: focused ? color : COLORS.textMuted }]}
      >
        {label}
      </Text>
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="DASH"
              iconName="dashboard"
              color={COLORS.cyan}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ScannerTab"
        component={ScannerScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="SCAN"
              iconName="qr-code-scanner"
              color={COLORS.yellow}
            />
          ),
        }}
        initialParams={{ mode: 'attendance' }}
      />
      <Tab.Screen
        name="StudentsTab"
        component={StudentsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="STUD"
              iconName="people"
              color={COLORS.pink}
            />
          ),
        }}
      />
      <Tab.Screen
        name="RecordsTab"
        component={RecordsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="REC"
              iconName="history"
              color={COLORS.purple}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              label="SET"
              iconName="settings"
              color={COLORS.orange}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Device" component={DeviceScreen} />
      <Stack.Screen name="Scanner" component={ScannerScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(0,8,22,0.97)',
    borderTopWidth: 1.5,
    borderTopColor: COLORS.cyan + '88',
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 4,
  },
});
