const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// EJS Template Engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Import Modular Routes
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Use Routes
app.use('/', indexRoutes);
app.use('/api', authRoutes);
app.use('/api', categoryRoutes);

app.listen(PORT, () => {
    console.log(`Server running smoothly on port ${PORT}`);
});
