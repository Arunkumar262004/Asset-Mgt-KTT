require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000/api';

// Set view engine and directories
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static assets
app.use(express.static(path.join(__dirname, '../public')));

// Middleware to inject backend API URL into views for client-side scripts
app.use((req, res, next) => {
  res.locals.backendApiUrl = BACKEND_API_URL;
  next();
});

// UI Route Handlers
app.get('/', (req, res) => {
  res.render('index', { title: 'Dashboard - Stock View', activePage: 'dashboard' });
});

app.get('/employees', (req, res) => {
  res.render('employees/index', { title: 'Employee Master', activePage: 'employees' });
});

app.get('/assets', (req, res) => {
  res.render('assets/index', { title: 'Asset Master', activePage: 'assets' });
});

app.get('/categories', (req, res) => {
  res.render('categories/index', { title: 'Asset Category Master', activePage: 'categories' });
});

app.get('/issue', (req, res) => {
  res.render('transactions/issue', { title: 'Issue Asset', activePage: 'issue' });
});

app.get('/return', (req, res) => {
  res.render('transactions/return', { title: 'Return Asset', activePage: 'return' });
});

app.get('/scrap', (req, res) => {
  res.render('transactions/scrap', { title: 'Scrap Asset', activePage: 'scrap' });
});

app.get('/history', (req, res) => {
  res.render('history/index', { title: 'Asset History', activePage: 'history' });
});

// Error handling
app.use((req, res) => {
  res.status(404).render('layout', { title: '404 - Not Found', error: 'Page not found' });
});

app.listen(PORT, () => {
  console.log(`Frontend UI Server running on port ${PORT}`);
  console.log(`Configured Backend API endpoint: ${BACKEND_API_URL}`);
});
