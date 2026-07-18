require('dotenv').config();
const express = require('express');
const cors = require('cors');


require('./src/config/supabase');

const authRoutes = require('./src/routes/authRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'FinTrack Backend berjalan!' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
  // console.log('Routes terdaftar:');
  // console.log('- /api/auth');
  // console.log('- /api/transactions');
  // console.log('- /api/users');
});