import {
  getSettings,
  addToOfflineQueue,
  getOfflineQueue,
  removeFromOfflineQueue,
} from './storage';

export const today = () => {
  return new Date().toISOString().split('T')[0];
};

const callApi = async (body, retryCount = 0) => {
  const settings = getSettings();
  if (!settings.apiUrl) {
    throw new Error('API URL not configured');
  }

  try {
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (retryCount < 2) {
      await new Promise(resolve =>
        setTimeout(resolve, 1000 * (retryCount + 1)),
      );
      return callApi(body, retryCount + 1);
    }
    throw error;
  }
};

export const markAttendance = async studentId => {
  const settings = getSettings();
  const body = {
    action: 'ec_attendance',
    studentId,
    teacher: settings.teacherName,
    date: today(),
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    await addToOfflineQueue('ec_attendance', body);
    return { success: false, offline: true, error: error.message };
  }
};

export const recordPayment = async (studentId, month, year) => {
  const settings = getSettings();
  const body = {
    action: 'ec_payment',
    studentId,
    month,
    year,
    teacher: settings.teacherName,
    date: today(),
    timestamp: new Date().toISOString(),
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    await addToOfflineQueue('ec_payment', body);
    return { success: false, offline: true, error: error.message };
  }
};

export const getStudentDetails = async studentId => {
  const body = {
    action: 'ec_details',
    studentId,
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllStudents = async () => {
  const body = {
    action: 'ec_get_students',
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const addStudent = async studentData => {
  const body = {
    action: 'ec_add_student',
    ...studentData,
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteStudent = async studentId => {
  const body = {
    action: 'ec_delete_student',
    studentId,
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAttendance = async (filters = {}) => {
  const body = {
    action: 'ec_get_attendance',
    ...filters,
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getPayments = async (filters = {}) => {
  const body = {
    action: 'ec_get_payments',
    ...filters,
  };

  try {
    const result = await callApi(body);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const syncOfflineQueue = async onProgress => {
  const queue = await getOfflineQueue();
  let synced = 0;

  for (let i = 0; i < queue.length; i++) {
    const item = queue[i];
    try {
      await callApi(item.data);
      await removeFromOfflineQueue(i);
      synced++;
      if (onProgress) {
        onProgress(synced, queue.length);
      }
    } catch (error) {
      console.error('Sync failed for item:', item);
    }
  }

  return { synced, total: queue.length };
};
