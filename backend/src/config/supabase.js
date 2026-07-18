const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test koneksi ke Supabase
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.log('❌ Koneksi Supabase GAGAL:', error.message);
    } else {
      console.log('✅ Koneksi Supabase BERHASIL!');
      // console.log('Jumlah kategori:', data.length);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
};

testConnection();

module.exports = supabase;