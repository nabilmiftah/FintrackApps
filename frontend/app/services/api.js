import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti dengan IP laptop kamu
// Cek IP dengan perintah: ipconfig (di CMD Windows)
const BASE_URL = 'http://172.16.203.113:3000/api';

const api = async (endpoint, method = 'GET', body = null) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const config = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    return data;

  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default api;