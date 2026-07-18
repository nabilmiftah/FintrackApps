import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, deleteTransaction } from '../services/transactionService';

const FILTER_LIST = ['Semua', 'Makanan', 'Transportasi', 'Belanja', 'Hiburan', 'Kesehatan', 'Lainnya'];

const CATEGORY_ICONS = {
  'Makanan': { icon: 'restaurant', color: '#EF4444' },
  'Transportasi': { icon: 'car', color: '#3B82F6' },
  'Belanja': { icon: 'cart', color: '#F97316' },
  'Hiburan': { icon: 'game-controller', color: '#8B5CF6' },
  'Kesehatan': { icon: 'medical', color: '#22C55E' },
  'Lainnya': { icon: 'ellipsis-horizontal', color: '#6B7280' },
};

export default function HistoryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Ambil data transaksi dari backend
  const fetchTransactions = async () => {
    try {
      // Hapus filter bulan, ambil semua transaksi
      const response = await getTransactions('', '');

      console.log('Response:', JSON.stringify(response));

      if (response.success) {
        setTransactions(response.data);
      } else {
        alert(response.message || 'Gagal mengambil data!');
      }
    } catch (error) {
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh saat screen difokus
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // Filter transaksi
  const filtered = transactions.filter((item) => {
    const categoryName = item.categories?.name || '';
    const matchFilter = activeFilter === 'Semua' || categoryName === activeFilter;
    const matchSearch = item.note?.toLowerCase().includes(search.toLowerCase()) ||
      categoryName.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Kelompokkan berdasarkan tanggal
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const hariIni = filtered.filter((t) => t.date === today);
  const kemarin = filtered.filter((t) => t.date === yesterday);
  const lebihLama = filtered.filter((t) => t.date < yesterday);

  const handleDelete = (id) => {
    Alert.alert(
      'Hapus Transaksi',
      'Yakin ingin menghapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteTransaction(id);
              if (response.success) {
                fetchTransactions();
              } else {
                alert(response.message || 'Gagal menghapus!');
              }
            } catch (error) {
              alert('Terjadi kesalahan: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item) => {
    navigation.navigate('EditExpense', { item });
  };

  const getCategoryStyle = (categoryName) => {
    return CATEGORY_ICONS[categoryName] || { icon: 'ellipsis-horizontal', color: '#6B7280' };
  };

  const renderItem = (item) => {
    const catStyle = getCategoryStyle(item.categories?.name);
    return (
      <View key={item.id} style={styles.transactionItem}>
        <View style={[styles.iconWrapper, { backgroundColor: catStyle.color + '20' }]}>
          <Ionicons name={catStyle.icon} size={20} color={catStyle.color} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionName}>
            {item.note || item.categories?.name}
          </Text>
          <Text style={styles.transactionCategory}>
            {item.categories?.name}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionAmount}>
            -Rp.{item.amount.toLocaleString('id-ID')}
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEdit(item)}
            >
              <Ionicons name="pencil" size={14} color="#22C55E" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash" size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Judul */}
      <Text style={styles.title}>Riwayat Transaksi</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari transaksi...."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTER_LIST.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter && styles.filterTextActive,
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List Transaksi */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hari Ini */}
        {hariIni.length > 0 && (
          <View>
            <Text style={styles.dateLabel}>Hari ini</Text>
            {hariIni.map(renderItem)}
          </View>
        )}

        {/* Kemarin */}
        {kemarin.length > 0 && (
          <View>
            <Text style={styles.dateLabel}>Kemarin</Text>
            {kemarin.map(renderItem)}
          </View>
        )}

        {/* Lebih Lama */}
        {lebihLama.length > 0 && (
          <View>
            <Text style={styles.dateLabel}>Sebelumnya</Text>
            {lebihLama.map(renderItem)}
          </View>
        )}

        {/* Kosong */}
        {filtered.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>Belum ada transaksi</Text>
          </View>
        )}

      </ScrollView>
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
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterScroll: {
    marginBottom: 14,
    maxHeight: 42,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});