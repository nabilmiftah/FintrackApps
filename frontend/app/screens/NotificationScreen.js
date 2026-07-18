import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationScreen({ navigation }) {
  const [notifTransaksi, setNotifTransaksi] = useState(true);
  const [notifBudget, setNotifBudget] = useState(true);
  const [notifPengingat, setNotifPengingat] = useState(false);
  const [notifLaporan, setNotifLaporan] = useState(false);

  const NotifItem = ({ icon, iconColor, iconBg, title, desc, value, onValueChange }) => (
    <View style={styles.notifItem}>
      <View style={[styles.notifIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.notifInfo}>
        <Text style={styles.notifTitle}>{title}</Text>
        <Text style={styles.notifDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
        thumbColor={value ? '#2563EB' : '#9CA3AF'}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Section Transaksi */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Transaksi</Text>

        <NotifItem
          icon="receipt-outline"
          iconColor="#2563EB"
          iconBg="#EFF6FF"
          title="Notifikasi Transaksi"
          desc="Pemberitahuan saat transaksi berhasil ditambahkan"
          value={notifTransaksi}
          onValueChange={setNotifTransaksi}
        />

        <NotifItem
          icon="wallet-outline"
          iconColor="#F97316"
          iconBg="#FFF7ED"
          title="Peringatan Budget"
          desc="Peringatan saat anggaran hampir habis"
          value={notifBudget}
          onValueChange={setNotifBudget}
        />
      </View>

      {/* Section Pengingat */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pengingat</Text>

        <NotifItem
          icon="alarm-outline"
          iconColor="#22C55E"
          iconBg="#F0FDF4"
          title="Pengingat Harian"
          desc="Ingatkan untuk mencatat pengeluaran setiap hari"
          value={notifPengingat}
          onValueChange={setNotifPengingat}
        />

        <NotifItem
          icon="bar-chart-outline"
          iconColor="#8B5CF6"
          iconBg="#F5F3FF"
          title="Laporan Bulanan"
          desc="Ringkasan pengeluaran di akhir bulan"
          value={notifLaporan}
          onValueChange={setNotifLaporan}
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
        <Text style={styles.infoText}>
          Pengaturan notifikasi akan diterapkan pada versi selanjutnya
        </Text>
      </View>

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
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifInfo: {
    flex: 1,
    marginRight: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  notifDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
});