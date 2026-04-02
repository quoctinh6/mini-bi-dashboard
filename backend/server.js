const express = require('express');
const cors = require('cors');
const authRoutes       = require('./routes/authRoutes');
const userRoutes       = require('./routes/userRoutes');
const masterDataRoutes = require('./routes/masterDataRoutes');
const uploadRoutes     = require('./routes/uploadRoutes');
const analyticsRoutes  = require('./routes/analyticsRoutes');
const manualEntryRoutes= require('./routes/manualEntryRoutes');
const dashboardRoutes  = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/master',    masterDataRoutes);
app.use('/api/data',      uploadRoutes);
app.use('/api/data',      manualEntryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings',  require('./routes/settingsRoutes'));

// Basic health check route
app.get('/', (req, res) => {
  res.send('Mini BI Dashboard Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
