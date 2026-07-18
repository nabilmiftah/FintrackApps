import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Modal, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTransaction } from '../services/transactionService';

const KATEGORI_LIST = [
  { id: 'cat_1', name: 'Makanan' },
  { id: 'cat_2', name: 'Transportasi' },
  { id: 'cat_3', name: 'Belanja' },
  { id: 'cat_4', name: 'Hiburan' },
  { id: 'cat_5', name: 'Kesehatan' },
  { id: 'cat_6', name: 'Lainnya' },
];

export default function AddExpenseScreen({ navigation }) {
  const [kategori, setKategori] = useState(KATEGORI_LIST[0]);
  const [namapengeluaran, setNamaPengeluaran] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format tanggal untuk ditampilkan
  const formatTanggal = (date) => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format tanggal untuk dikirim ke database
  const formatTanggalDB = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTanggal(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!namapengeluaran) {
      alert('Nama pengeluaran tidak boleh kosong!');
      return;
    }
    if (!jumlah) {
      alert('Jumlah tidak boleh kosong!');
      return;
    }

    setLoading(true);
    try {
      const response = await createTransaction({
        category_id: kategori.id,
        amount: parseFloat(jumlah),
        note: namapengeluaran,
        date: formatTanggalDB(tanggal),
      });

      if (response.success) {
        alert('Pengeluaran berhasil disimpan!');
        setNamaPengeluaran('');
        setJumlah('');
        setKategori(KATEGORI_LIST[0]);
        setTanggal(new Date());
        navigation.navigate('Home');
      } else {
        alert(response.message || 'Gagal menyimpan!');
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
        <Text style={styles.headerTitle}>
          Add <Text style={styles.headerTitleBlue}>Expense</Text>
        </Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Kategori */}
          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.dropdownText}>{kategori.name}</Text>
            <Ionicons name="chevron-down" size={20} color="#374151" />
          </TouchableOpacity>

          {/* Modal Dropdown */}
          <Modal visible={showDropdown} transparent animationType="fade">
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowDropdown(false)}
            >
              <View style={styles.modalContent}>
                {KATEGORI_LIST.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.modalItem}
                    onPress={() => {
                      setKategori(item);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      kategori.id === item.id && styles.modalItemActive
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Nama Pengeluaran */}
          <Text style={styles.label}>Nama Pengeluaran</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Tisu, Bakmi Jawa, Grab..."
              placeholderTextColor="#9CA3AF"
              value={namapengeluaran}
              onChangeText={setNamaPengeluaran}
            />
          </View>

          {/* Jumlah */}
          <Text style={styles.label}>Jumlah</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Rp.xxx"
              placeholderTextColor="#9CA3AF"
              value={jumlah}
              onChangeText={setJumlah}
              keyboardType="numeric"
            />
          </View>

          {/* Tanggal — pakai Date Picker */}
          <Text style={styles.label}>Tanggal</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.tanggalText}>
              {formatTanggal(tanggal)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#374151" />
          </TouchableOpacity>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={tanggal}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {/* Tombol Save */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
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
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    paddingTop: 30,
    paddingBottom: 8,
  },
  headerTitleBlue: {
    color: '#2563EB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 20,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 15,
    color: '#374151',
  },
  modalItemActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  tanggalText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});