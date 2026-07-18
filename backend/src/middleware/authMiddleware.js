const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan, silakan login!'
      });
    }

    // Verifikasi token ke Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid, silakan login ulang!'
      });
    }

    req.user = data.user;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Autentikasi gagal!'
    });
  }
};

module.exports = authMiddleware;