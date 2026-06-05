import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  API_URL: 'sn_api',
  TEACHER_NAME: 'sn_teacher',
  DEV_NAME: 'sn_dev',
  PASSWORD: 'sn_pass',
  FP_ENABLED: 'sn_fp',
  DEVICE_IP: 'sn_dev_ip',
  DEVICE_NAME: 'sn_dev_name',
  DEVICE_LINKED: 'sn_dev_linked',
  OFFLINE_QUEUE: 'sn_offline_queue',
};

let settingsCache = {
  apiUrl: '',
  teacherName: 'Madhavi Rathnayake',
  devName: 'Thuli',
  password: '',
  fpEnabled: false,
  deviceIp: '',
  deviceName: '',
  deviceLinked: false,
};

export const loadSettings = async () => {
  try {
    const apiUrl = await AsyncStorage.getItem(KEYS.API_URL);
    const teacherName = await AsyncStorage.getItem(KEYS.TEACHER_NAME);
    const devName = await AsyncStorage.getItem(KEYS.DEV_NAME);
    const password = await AsyncStorage.getItem(KEYS.PASSWORD);
    const fpEnabled = await AsyncStorage.getItem(KEYS.FP_ENABLED);
    const deviceIp = await AsyncStorage.getItem(KEYS.DEVICE_IP);
    const deviceName = await AsyncStorage.getItem(KEYS.DEVICE_NAME);
    const deviceLinked = await AsyncStorage.getItem(KEYS.DEVICE_LINKED);

    settingsCache = {
      apiUrl: apiUrl || '',
      teacherName: teacherName || 'Madhavi Rathnayake',
      devName: devName || 'Thuli',
      password: password || '',
      fpEnabled: fpEnabled === 'true',
      deviceIp: deviceIp || '',
      deviceName: deviceName || '',
      deviceLinked: deviceLinked === 'true',
    };

    return settingsCache;
  } catch (error) {
    return settingsCache;
  }
};

export const saveSettings = async settings => {
  try {
    if (settings.apiUrl !== undefined) {
      await AsyncStorage.setItem(KEYS.API_URL, settings.apiUrl);
      settingsCache.apiUrl = settings.apiUrl;
    }
    if (settings.teacherName !== undefined) {
      await AsyncStorage.setItem(KEYS.TEACHER_NAME, settings.teacherName);
      settingsCache.teacherName = settings.teacherName;
    }
    if (settings.devName !== undefined) {
      await AsyncStorage.setItem(KEYS.DEV_NAME, settings.devName);
      settingsCache.devName = settings.devName;
    }
    if (settings.password !== undefined) {
      await AsyncStorage.setItem(KEYS.PASSWORD, settings.password);
      settingsCache.password = settings.password;
    }
    if (settings.fpEnabled !== undefined) {
      await AsyncStorage.setItem(
        KEYS.FP_ENABLED,
        settings.fpEnabled.toString(),
      );
      settingsCache.fpEnabled = settings.fpEnabled;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const getSettings = () => ({ ...settingsCache });

export const saveDevice = async device => {
  try {
    if (device.ip !== undefined) {
      await AsyncStorage.setItem(KEYS.DEVICE_IP, device.ip);
      settingsCache.deviceIp = device.ip;
    }
    if (device.name !== undefined) {
      await AsyncStorage.setItem(KEYS.DEVICE_NAME, device.name);
      settingsCache.deviceName = device.name;
    }
    if (device.linked !== undefined) {
      await AsyncStorage.setItem(KEYS.DEVICE_LINKED, device.linked.toString());
      settingsCache.deviceLinked = device.linked;
    }
    return true;
  } catch (error) {
    return false;
  }
};

export const loadDevice = async () => {
  return {
    ip: settingsCache.deviceIp,
    name: settingsCache.deviceName,
    linked: settingsCache.deviceLinked,
  };
};

export const clearDevice = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.DEVICE_IP);
    await AsyncStorage.removeItem(KEYS.DEVICE_NAME);
    await AsyncStorage.removeItem(KEYS.DEVICE_LINKED);
    settingsCache.deviceIp = '';
    settingsCache.deviceName = '';
    settingsCache.deviceLinked = false;
    return true;
  } catch (error) {
    return false;
  }
};

export const addToOfflineQueue = async (action, data) => {
  try {
    const queue = await getOfflineQueue();
    queue.push({ action, data, timestamp: Date.now() });
    await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    return false;
  }
};

export const getOfflineQueue = async () => {
  try {
    const queue = await AsyncStorage.getItem(KEYS.OFFLINE_QUEUE);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    return [];
  }
};

export const removeFromOfflineQueue = async index => {
  try {
    const queue = await getOfflineQueue();
    queue.splice(index, 1);
    await AsyncStorage.setItem(KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    return true;
  } catch (error) {
    return false;
  }
};
