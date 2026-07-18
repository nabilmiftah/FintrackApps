const supabase = require('../config/supabase');

// Register
const register = async (req, res) => {
  try {
    const { email, password, nama } = req.body;

    // Validasi input
    if (!email || !password || !nama) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, dan nama harus diisi!'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter!'
      });
    }

    // Daftarkan user ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // Simpan data user ke tabel users
    const { error: dbError } = await supabase.from('users').insert({
      uid: authData.user.id,
      email: email,
      display_name: nama,
      monthly_limit: 0,
      created_at: new Date()
    });

    if (dbError) throw dbError;

    res.status(201).json({
      success: true,
      message: 'Register berhasil!',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nama: nama
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi!'
      });
    }

    // Login ke Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Ambil data user dari tabel users
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('uid', authData.user.id)
      .single();

    if (dbError) throw dbError;

    res.json({
      success: true,
      message: 'Login berhasil!',
      token: authData.session.access_token,
      user: {
        id: userData.uid,
        email: userData.email,
        nama: userData.display_name,
        monthly_limit: userData.monthly_limit
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    res.json({
      success: true,
      message: 'Logout berhasil!'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { register, login, logout };