import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUser } from '../services/authService';
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';


export default function ProfileScreen({ navigation }) {

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => navigation.replace('Login'),
        },
      ]
    );
  };

  const [user, setUser] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        const userData = await getUser();
        setUser(userData);
      };
      fetchUser();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Judul */}
      <Text style={styles.title}>Profile</Text>

      {/* Foto Profil */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#6B7280" />
          </View>
          {/* Tombol Edit Foto */}
          <TouchableOpacity style={styles.editAvatarBtn}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user?.nama || 'Pengguna'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@gmail.com'}</Text>
      </View>

      {/* Menu */}
      <View style={styles.menuContainer}>

        {/* My Account */}
        <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('MyAccount')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="person-outline" size={18} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>My Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Notification')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="notifications-outline" size={18} color="#F97316" />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Ubah Password */}
        <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('ChangePassword')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#22C55E" />
            </View>
            <Text style={styles.menuText}>Ubah Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Log Out */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            </View>
            <Text style={styles.menuTextRed}>Log Out</Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* Versi App */}
      <Text style={styles.version}>v1.0.0</Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    paddingTop: 16,
    paddingBottom: 30,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  menuTextRed: {
    fontSize: 15,
    fontWeight: '500',
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 32,
  },
});