import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateTransaction } from '../services/transactionService';
import { ActivityIndicator } from 'react-native';

const KATEGORI_LIST = [
  { id: 'cat_1', name: 'Makanan' },
  { id: 'cat_2', name: 'Transportasi' },
  { id: 'cat_3', name: 'Belanja' },
  { id: 'cat_4', name: 'Hiburan' },
  { id: 'cat_5', name: 'Kesehatan' },
  { id: 'cat_6', name: 'Lainnya' },
];

export default function EditExpenseScreen({ navigation, route }) {
  const existing = route.params?.item;

  const [kategori, setKategori] = useState(
  KATEGORI_LIST.find((k) => k.id === existing?.category_id) || KATEGORI_LIST[0]
  );
  const [namaPengeluaran, setNamaPengeluaran] = useState(existing?.note || '');
  const [jumlah, setJumlah] = useState(existing?.amount?.toString() || '');
  const [tanggal, setTanggal] = useState(
    existing?.date ? new Date(existing.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const formatTanggal = (date) => {
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

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
    if (!namaPengeluaran) {
      alert('Nama pengeluaran tidak boleh kosong!');
      return;
    }
    if (!jumlah) {
      alert('Jumlah tidak boleh kosong!');
      return;
    }

    setLoading(true);
    try {
      const response = await updateTransaction(existing.id, {
        category_id: kategori.id,
        amount: parseFloat(jumlah),
        note: namaPengeluaran,
        date: formatTanggalDB(tanggal),
      });

      if (response.success) {
        alert('Pengeluaran berhasil diupdate!');
        navigation.goBack();
      } else {
        alert(response.message || 'Gagal mengupdate!');
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
          <Text style={styles.headerTitle}>
            Update <Text style={styles.headerTitleBlue}>Expense</Text>
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Form */}
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

          {/* Nama pengeluaran */}
          <Text style={styles.label}>Nama Pengeluaran</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Tisu, Bakmi Jawa, Grab..."
              placeholderTextColor="#9CA3AF"
              value={namaPengeluaran}
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

          {/* Tanggal */}
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

          {/* Tombol Save Changes */}
          <TouchableOpacity
            style={[styles.saveButton, loading && { backgroundColor: '#93C5FD' }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save changes</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
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
    marginTop: 80,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});