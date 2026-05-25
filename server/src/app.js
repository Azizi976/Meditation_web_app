require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

const authRoutes       = require('./routes/auth');
const meditationRoutes = require('./routes/meditations');
const ambientRoutes    = require('./routes/ambient');
const userRoutes       = require('./routes/user');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth',        authRoutes);
app.use('/api/meditations', meditationRoutes);
app.use('/api/ambient',     ambientRoutes);
app.use('/api/user',        userRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
