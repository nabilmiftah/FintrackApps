const supabase = require('../config/supabase');

// CREATE — Tambah transaksi baru
const createTransaction = async (req, res) => {
  try {
    const { category_id, amount, note, date } = req.body;
    const user_id = req.user.id;

    // Validasi input
    if (!category_id || !amount || !date) {
      return res.status(400).json({
        success: false,
        message: 'Kategori, jumlah, dan tanggal harus diisi!'
      });
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id,
        category_id,
        amount,
        note,
        date,
        created_at: new Date()
      })
      .select();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil ditambahkan!',
      data: data[0]
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// READ — Ambil semua transaksi user
const getTransactions = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { category_id, month, year } = req.query;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories (id, name, icon, color)
      `)
      .eq('user_id', user_id)
      .order('date', { ascending: false });

    // Filter by category
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    // Filter by month & year
    if (month && year && month !== '' && year !== '') {
      const startDate = `${year}-${month.padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// READ — Ambil 1 transaksi by ID
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories (id, name, icon, color)
      `)
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan!'
      });
    }

    res.json({
      success: true,
      data: data
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE — Update transaksi
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, amount, note, date } = req.body;
    const user_id = req.user.id;

    const { data, error } = await supabase
      .from('transactions')
      .update({ category_id, amount, note, date })
      .eq('id', id)
      .eq('user_id', user_id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan!'
      });
    }

    res.json({
      success: true,
      message: 'Transaksi berhasil diupdate!',
      data: data[0]
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE — Hapus transaksi
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Transaksi berhasil dihapus!'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET SUMMARY — Total pengeluaran per kategori
const getSummary = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { month, year } = req.query;

    let query = supabase
      .from('transactions')
      .select(`
        amount,
        categories (id, name, icon, color)
      `)
      .eq('user_id', user_id);

    if (month && year && month !== '' && year !== '') {
      const monthPadded = month.toString().padStart(2, '0');
      const startDate = `${year}-${monthPadded}-01`;
      const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0))
        .toISOString()
        .split('T')[0];

        // console.log('Month:', month);
        // console.log('Year:', year);
        // console.log('Start Date:', startDate);
        // console.log('End Date:', endDate);

      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Hitung total per kategori
    const summary = {};
    let totalAmount = 0;

    data.forEach((item) => {
      const catName = item.categories.name;
      if (!summary[catName]) {
        summary[catName] = {
          name: catName,
          icon: item.categories.icon,
          color: item.categories.color,
          total: 0
        };
      }
      summary[catName].total += item.amount;
      totalAmount += item.amount;
    });

    // Hitung persentase
    const result = Object.values(summary).map((item) => ({
      ...item,
      percentage: Math.round((item.total / totalAmount) * 100)
    }));

    res.json({
      success: true,
      total: totalAmount,
      data: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary
};