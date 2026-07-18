import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { changePassword } from '../services/authService';

export default function ChangePasswordScreen({ navigation }) {
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [showPasswordBaru, setShowPasswordBaru] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!passwordBaru || !konfirmasiPassword) {
      alert('Semua field harus diisi!');
      return;
    }

    if (passwordBaru.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      alert('Konfirmasi password tidak cocok!');
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword(passwordBaru);
      if (response.success) {
        alert('Password berhasil diubah!');
        navigation.goBack();
      } else {
        alert(response.message || 'Gagal mengubah password!');
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ubah Password</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Ionicons name="shield-checkmark-outline" size={40} color="#2563EB" />
            <Text style={styles.infoTitle}>Keamanan Akun</Text>
            <Text style={styles.infoDesc}>
              Pastikan password baru kamu minimal 6 karakter dan mudah diingat
            </Text>
          </View>

          {/* Password Baru */}
          <Text style={styles.label}>Password Baru</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan password baru"
              placeholderTextColor="#9CA3AF"
              value={passwordBaru}
              onChangeText={setPasswordBaru}
              secureTextEntry={!showPasswordBaru}
            />
            <TouchableOpacity onPress={() => setShowPasswordBaru(!showPasswordBaru)}>
              <Ionicons
                name={showPasswordBaru ? 'eye' : 'eye-off'}
                size={18}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Konfirmasi Password */}
          <Text style={styles.label}>Konfirmasi Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.input}
              placeholder="Ulangi password baru"
              placeholderTextColor="#9CA3AF"
              value={konfirmasiPassword}
              onChangeText={setKonfirmasiPassword}
              secureTextEntry={!showKonfirmasi}
            />
            <TouchableOpacity onPress={() => setShowKonfirmasi(!showKonfirmasi)}>
              <Ionicons
                name={showKonfirmasi ? 'eye' : 'eye-off'}
                size={18}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Indikator kekuatan password */}
          {passwordBaru.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View style={[
                  styles.strengthFill,
                  {
                    width: passwordBaru.length < 6 ? '33%'
                      : passwordBaru.length < 10 ? '66%' : '100%',
                    backgroundColor: passwordBaru.length < 6 ? '#EF4444'
                      : passwordBaru.length < 10 ? '#F97316' : '#22C55E'
                  }
                ]} />
              </View>
              <Text style={[
                styles.strengthText,
                {
                  color: passwordBaru.length < 6 ? '#EF4444'
                    : passwordBaru.length < 10 ? '#F97316' : '#22C55E'
                }
              ]}>
                {passwordBaru.length < 6 ? 'Lemah'
                  : passwordBaru.length < 10 ? 'Sedang' : 'Kuat'}
              </Text>
            </View>
          )}

          {/* Tombol Simpan */}
          <TouchableOpacity
            style={[styles.saveButton, loading && { backgroundColor: '#93C5FD' }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Ubah Password</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  infoContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  strengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});