import api from './api';

// Ambil semua transaksi
export const getTransactions = async (month, year) => {
  return await api(`/transactions?month=${month}&year=${year}`);
};

// Tambah transaksi
export const createTransaction = async (data) => {
  return await api('/transactions', 'POST', data);
};

// Update transaksi
export const updateTransaction = async (id, data) => {
  return await api(`/transactions/${id}`, 'PUT', data);
};

// Hapus transaksi
export const deleteTransaction = async (id) => {
  return await api(`/transactions/${id}`, 'DELETE');
};

// Ambil summary
export const getSummary = async (month, year) => {
  return await api(`/transactions/summary?month=${month}&year=${year}`);
};