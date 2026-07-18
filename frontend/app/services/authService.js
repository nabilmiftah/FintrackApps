import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Register
export const register = async (email, password, nama) => {
  const response = await api('/auth/register', 'POST', {
    email, password, nama
  });
  return response;
};

// Login
export const login = async (email, password) => {
  const response = await api('/auth/login', 'POST', {
    email, password
  });

  if (response.success) {
    // Simpan token dan data user
    await AsyncStorage.setItem('token', response.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
  }

  return response;
};

// Logout
export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

// Cek apakah sudah login
export const isLoggedIn = async () => {
  const token = await AsyncStorage.getItem('token');
  return token !== null;
};

// Ambil data user
export const getUser = async () => {
  const user = await AsyncStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// update profile
export const updateProfile = async (nama) => {
  console.log('Calling update profile...');
  const response = await api('/users/profile', 'PUT', { nama });
  console.log('Response:', JSON.stringify(response));
  if (response.success) {
    const user = await getUser();
    await AsyncStorage.setItem('user', JSON.stringify({ ...user, nama }));
  }
  return response;
};

export const changePassword = async (passwordBaru) => {
  const response = await api('/users/change-password', 'PUT', {
    password_baru: passwordBaru
  });
  return response;
};