const supabase = require('../config/supabase');

// Update profil user
const updateProfile = async (req, res) => {
  try {
    const { nama } = req.body;
    const user_id = req.user.id;

    if (!nama) {
      return res.status(400).json({
        success: false,
        message: 'Nama tidak boleh kosong!'
      });
    }

    const { error } = await supabase
      .from('users')
      .update({ display_name: nama })
      .eq('uid', user_id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Profil berhasil diupdate!',
      data: { nama }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Tambahkan fungsi ini
const changePassword = async (req, res) => {
  try {
    const { password_baru } = req.body;

    if (!password_baru) {
      return res.status(400).json({
        success: false,
        message: 'Password baru tidak boleh kosong!'
      });
    }

    if (password_baru.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter!'
      });
    }

    const { error } = await supabase.auth.updateUser({
      password: password_baru
    });

    if (error) throw error;

    res.json({
      success: true,
      message: 'Password berhasil diubah!'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { updateProfile, changePassword };