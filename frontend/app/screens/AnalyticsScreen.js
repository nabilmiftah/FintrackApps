import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  ScrollView, ActivityIndicator,
  RefreshControl, TouchableOpacity, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { getSummary } from '../services/transactionService';

// Komponen Donut Chart
function DonutChart({ data, size = 220, strokeWidth = 50 }) {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) return null;

  if (data.length === 1) {
    return (
      <Svg width={size} height={size}>
        <Path
          d={`M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`}
          stroke={data[0].color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
        />
      </Svg>
    );
  }

  let startAngle = -Math.PI / 2;
  const slices = data.map((item) => {
    const angle = (item.value / total) * 2 * Math.PI;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const endAngle = startAngle + angle;
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
    startAngle = endAngle;
    return { ...item, pathData };
  });

  return (
    <Svg width={size} height={size}>
      {slices.map((slice, index) => (
        <Path
          key={index}
          d={slice.pathData}
          stroke={slice.color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="butt"
        />
      ))}
    </Svg>
  );
}

const CATEGORY_COLORS = {
  'Makanan': '#22C55E',
  'Transportasi': '#F97316',
  'Belanja': '#EC4899',
  'Hiburan': '#8B5CF6',
  'Kesehatan': '#3B82F6',
  'Lainnya': '#6B7280',
};

const CATEGORY_ICONS = {
  'Makanan': { icon: 'restaurant', color: '#EF4444', bg: '#FEF2F2' },
  'Transportasi': { icon: 'car', color: '#3B82F6', bg: '#EFF6FF' },
  'Belanja': { icon: 'cart', color: '#F97316', bg: '#FFF7ED' },
  'Hiburan': { icon: 'game-controller', color: '#8B5CF6', bg: '#F5F3FF' },
  'Kesehatan': { icon: 'medical', color: '#22C55E', bg: '#F0FDF4' },
  'Lainnya': { icon: 'ellipsis-horizontal', color: '#6B7280', bg: '#F9FAFB' },
};

const BULAN_LIST = [
  { label: 'Januari', value: 1 },
  { label: 'Februari', value: 2 },
  { label: 'Maret', value: 3 },
  { label: 'April', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Juni', value: 6 },
  { label: 'Juli', value: 7 },
  { label: 'Agustus', value: 8 },
  { label: 'September', value: 9 },
  { label: 'Oktober', value: 10 },
  { label: 'November', value: 11 },
  { label: 'Desember', value: 12 },
];

export default function AnalyticsScreen() {
  const [summaryData, setSummaryData] = useState([]);
  const [totalPengeluaran, setTotalPengeluaran] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getMonthLabel = (month) => {
    return BULAN_LIST.find((b) => b.value === month)?.label || '';
  };

  const fetchSummary = async (month, year) => {
    try {
      const response = await getSummary(
        month.toString(),
        year.toString()
      );
      if (response.success) {
        setSummaryData(response.data);
        setTotalPengeluaran(response.total);
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
      fetchSummary(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary(selectedMonth, selectedYear);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const now = new Date();
    if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1) return;
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const donutData = summaryData.map((item) => ({
    name: item.name,
    value: item.total,
    color: CATEGORY_COLORS[item.name] || '#6B7280',
  }));

  const kategoriTerbesar = summaryData.length > 0
    ? summaryData.reduce((max, item) => item.total > max.total ? item : max, summaryData[0])
    : null;

  const getTips = (kategori) => {
    const tips = {
      'Makanan': 'Pengeluaran makananmu cukup besar! Coba masak di rumah lebih sering untuk lebih hemat.',
      'Transportasi': 'Pengeluaran transportasimu tinggi! Coba gunakan transportasi umum atau carpooling.',
      'Belanja': 'Pengeluaran belanjamu besar! Buat daftar belanja sebelum pergi agar tidak impulsif.',
      'Hiburan': 'Pengeluaran hiburanmu cukup besar! Cari alternatif hiburan gratis di sekitarmu.',
      'Kesehatan': 'Investasi kesehatan itu penting! Pastikan pengeluaran ini memang diperlukan.',
      'Lainnya': 'Catat lebih detail pengeluaranmu agar bisa menganalisis dengan lebih baik.',
    };
    return tips[kategori] || 'Tetap bijak dalam mengelola keuanganmu ya!';
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Judul */}
        <Text style={styles.title}>
          Analisis <Text style={styles.titleBlue}>Keuangan</Text>
        </Text>

        {/* Filter Bulan */}
        <View style={styles.monthFilterContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handlePrevMonth}
          >
            <Ionicons name="chevron-back" size={20} color="#2563EB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => setShowMonthPicker(true)}
          >
            <Ionicons name="calendar-outline" size={16} color="#2563EB" />
            <Text style={styles.monthText}>
              {getMonthLabel(selectedMonth)} {selectedYear}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={handleNextMonth}
          >
            <Ionicons name="chevron-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        {/* Modal Pilih Bulan */}
        <Modal visible={showMonthPicker} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setShowMonthPicker(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Pilih Bulan</Text>
              {BULAN_LIST.map((bulan) => (
                <TouchableOpacity
                  key={bulan.value}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedMonth(bulan.value);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedMonth === bulan.value && styles.modalItemActive
                  ]}>
                    {bulan.label} {selectedYear}
                  </Text>
                  {selectedMonth === bulan.value && (
                    <Ionicons name="checkmark" size={18} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Jika belum ada data */}
        {summaryData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="pie-chart-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              Belum ada transaksi di {getMonthLabel(selectedMonth)} {selectedYear}
            </Text>
            <Text style={styles.emptySubText}>
              Tambahkan transaksi atau pilih bulan lain
            </Text>
          </View>
        ) : (
          <>
            {/* Donut Chart */}
            <View style={styles.chartContainer}>
              <DonutChart data={donutData} size={220} strokeWidth={50} />
              <View style={styles.chartCenter} pointerEvents="none">
                <Text style={styles.chartCenterLabel}>Total</Text>
                <Text style={styles.chartCenterLabel}>pengeluaran</Text>
                <Text style={styles.chartCenterAmount}>
                  Rp. {totalPengeluaran.toLocaleString('id-ID')}
                </Text>
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
              {donutData.map((item) => (
                <View key={item.name} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name}</Text>
                </View>
              ))}
            </View>

            {/* Rincian Pengeluaran */}
            <Text style={styles.sectionTitle}>Rincian Pengeluaran</Text>
            <View style={styles.rincianContainer}>
              {summaryData.map((item) => {
                const catStyle = CATEGORY_ICONS[item.name] || {
                  icon: 'ellipsis-horizontal',
                  color: '#6B7280',
                  bg: '#F9FAFB'
                };
                return (
                  <View key={item.name} style={styles.rincianItem}>
                    <View style={[styles.rincianIcon, { backgroundColor: catStyle.bg }]}>
                      <Ionicons name={catStyle.icon} size={20} color={catStyle.color} />
                    </View>
                    <View style={styles.rincianInfo}>
                      <Text style={styles.rincianName}>{item.name}</Text>
                      <Text style={styles.rincianPercentage}>
                        {item.percentage}% dari total
                      </Text>
                    </View>
                    <Text style={styles.rincianAmount}>
                      Rp. {item.total.toLocaleString('id-ID')}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Tips Hemat */}
            {kategoriTerbesar && (
              <View style={styles.tipsContainer}>
                <View style={styles.tipsHeader}>
                  <Ionicons name="bulb-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.tipsTitle}>TIPS HEMAT HARI INI</Text>
                </View>
                <Text style={styles.tipsText}>
                  {getTips(kategoriTerbesar.name)}
                </Text>
              </View>
            )}
          </>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    paddingTop: 16,
    paddingBottom: 16,
  },
  titleBlue: {
    color: '#2563EB',
  },

  // Filter Bulan
  monthFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 12,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },

  // Modal
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
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 14,
    color: '#374151',
  },
  modalItemActive: {
    color: '#2563EB',
    fontWeight: '600',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Chart
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    position: 'relative',
    marginBottom: 8,
  },
  chartCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartCenterAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginTop: 2,
  },

  // Legend
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#374151',
  },

  // Rincian
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  rincianContainer: {
    gap: 10,
    marginBottom: 20,
  },
  rincianItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rincianIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rincianInfo: {
    flex: 1,
  },
  rincianName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rincianPercentage: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  rincianAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  // Tips
  tipsContainer: {
    backgroundColor: '#16A34A',
    borderRadius: 14,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tipsText: {
    fontSize: 13,
    color: '#DCFCE7',
    lineHeight: 20,
  },
});