import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, TouchableOpacity, StatusBar,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getUser } from '../services/authService';
import { getTransactions } from '../services/transactionService';

const CATEGORY_ICONS = {
  'Makanan': { icon: 'restaurant', color: '#EF4444' },
  'Transportasi': { icon: 'car', color: '#3B82F6' },
  'Belanja': { icon: 'cart', color: '#F97316' },
  'Hiburan': { icon: 'game-controller', color: '#8B5CF6' },
  'Kesehatan': { icon: 'medical', color: '#22C55E' },
  'Lainnya': { icon: 'ellipsis-horizontal', color: '#6B7280' },
};

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const MONTHLY_BUDGET = 2500000;

  const fetchData = async () => {
    try {
      const userData = await getUser();
      setUser(userData);

      const response = await getTransactions(
        currentMonth.toString(),
        currentYear.toString()
      );
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (error) {
      console.log('Error:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Hitung total pengeluaran & sisa anggaran
  const totalPengeluaran = transactions.reduce(
    (sum, item) => sum + item.amount, 0
  );
  const sisaAnggaran = MONTHLY_BUDGET - totalPengeluaran;
  const persentaseTerpakai = Math.min(
    Math.round((totalPengeluaran / MONTHLY_BUDGET) * 100), 100
  );

  // Warna progress bar dinamis
  const progressColor = persentaseTerpakai >= 90
    ? '#EF4444'
    : persentaseTerpakai >= 70
    ? '#F97316'
    : '#22C55E';

  // 3 transaksi terbaru
  const recentTransactions = transactions.slice(0, 3);

  const getCategoryStyle = (categoryName) => {
    return CATEGORY_ICONS[categoryName] || { icon: 'ellipsis-horizontal', color: '#6B7280' };
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Biru — sampai atas */}
        <View style={styles.blueBackground}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Good Morning</Text>
                <Text style={styles.userName}>
                  {user?.nama || 'Pengguna'}
                </Text>
              </View>
              <TouchableOpacity style={styles.bellButton}>
                <Ionicons name="notifications-outline" size={22} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Card Floating */}
        <View style={styles.cardWrapper}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              Rp.{sisaAnggaran.toLocaleString('id-ID')}
            </Text>
            <View style={styles.cardDivider} />
            <Text style={styles.pengeluaranLabel}>Pengeluaran bulan ini</Text>
            <Text style={styles.pengeluaranAmount}>
              Rp. {totalPengeluaran.toLocaleString('id-ID')},00
            </Text>
          </View>
        </View>

        {/* Area Putih */}
        <View style={styles.whiteContent}>

          {/* Anggaran Bulanan */}
          <View style={styles.anggaranSection}>
            <Text style={styles.sectionTitle}>Anggaran Bulanan</Text>
            <Text style={styles.sisaAnggaran}>
              Sisa Anggaran:{' '}
              <Text style={styles.sisaAnggaranAmount}>
                Rp. {sisaAnggaran.toLocaleString('id-ID')}
              </Text>
            </Text>
            <View style={styles.progressBackground}>
              <View style={[
                styles.progressFill,
                {
                  width: `${persentaseTerpakai}%`,
                  backgroundColor: progressColor
                }
              ]} />
            </View>
            <Text style={styles.progressText}>{persentaseTerpakai}% Terpakai</Text>
          </View>

          <View style={styles.dividerGaris} />

          {/* Transactions History */}
          <View style={styles.transactionSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transactions History</Text>
              <TouchableOpacity onPress={() => navigation.navigate('History')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
                <Text style={styles.emptyText}>Belum ada transaksi</Text>
              </View>
            ) : (
              recentTransactions.map((item) => {
                const catStyle = getCategoryStyle(item.categories?.name);
                return (
                  <View key={item.id} style={styles.transactionItem}>
                    <View style={[styles.transactionIcon, { backgroundColor: catStyle.color + '20' }]}>
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
                        Rp. {item.amount.toLocaleString('id-ID')}
                      </Text>
                      <Text style={styles.transactionTime}>
                        {new Date(item.date).toLocaleDateString('id-ID')}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  blueBackground: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingBottom: 100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  greeting: {
    fontSize: 13,
    color: '#BFDBFE',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginTop: -45,
    marginBottom: 8,
    zIndex: 10,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 10,
  },
  pengeluaranLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  pengeluaranAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  whiteContent: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 100,
  },
  anggaranSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  dividerGaris: {
    height: 8,
    backgroundColor: '#F3F4F6',
  },
  transactionSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sisaAnggaran: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
  },
  sisaAnggaranAmount: {
    fontWeight: '600',
    color: '#111827',
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  viewAll: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  transactionTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});