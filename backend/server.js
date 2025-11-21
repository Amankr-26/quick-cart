// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// serve frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// simple API: /api/products?name=milk
app.get('/api/products', async (req, res) => {
  const name = (req.query.name || '').toLowerCase();

  if (!name) {
    return res.status(400).json({ error: 'Product name is required' });
  }

  try {
    const result = await pool.query(
      'SELECT product_name, platform, price, site_url FROM product_prices WHERE LOWER(product_name) = $1',
      [name]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// fallback to index.html for root
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
