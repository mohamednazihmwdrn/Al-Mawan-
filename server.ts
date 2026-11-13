import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
  INITIAL_BANNERS
} from './src/data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Data storage file path
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store_data.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoreDatabase {
  lastUpdated: number;
  products: any[];
  categories: any[];
  settings: any;
  orders: any[];
  banners: any[];
}

function loadDatabase(): StoreDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (data && data.products && data.categories) {
        // Ensure new fields exist and store address/phones are up to date
        if (!data.banners || !Array.isArray(data.banners) || data.banners.length === 0) {
          data.banners = INITIAL_BANNERS;
        }
        if (data.settings) {
          data.settings.address = INITIAL_SETTINGS.address;
          data.settings.phoneNumber = INITIAL_SETTINGS.phoneNumber;
          data.settings.phoneNumber2 = INITIAL_SETTINGS.phoneNumber2;
          data.settings.whatsappNumber = INITIAL_SETTINGS.whatsappNumber;
        }
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading database file, resetting to initial data:', err);
  }

  // Initial seeding
  const initialDb: StoreDatabase = {
    lastUpdated: Date.now(),
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SETTINGS,
    orders: INITIAL_ORDERS,
    banners: INITIAL_BANNERS,
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(data: StoreDatabase): void {
  try {
    data.lastUpdated = Date.now();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database:', err);
  }
}

let db = loadDatabase();

// ----------------- API ROUTES ----------------- //

// Sync State (Used by clients for instant real-time synchronization)
app.get('/api/sync-state', (req, res) => {
  res.json({
    lastUpdated: db.lastUpdated,
    products: db.products,
    categories: db.categories,
    settings: db.settings,
    orders: db.orders,
    banners: db.banners,
  });
});

// Lightweight timestamp poll for real-time live updates
app.get('/api/sync-timestamp', (req, res) => {
  res.json({ lastUpdated: db.lastUpdated });
});

// Products API
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
  };
  db.products = [newProduct, ...db.products];
  saveDatabase(db);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  db.products = db.products.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
  saveDatabase(db);
  res.json({ success: true, product: db.products.find((p) => p.id === id) });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.products = db.products.filter((p) => p.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

app.post('/api/products/:id/toggle-stock', (req, res) => {
  const { id } = req.params;
  db.products = db.products.map((p) => {
    if (p.id === id) {
      const nextStatus = !p.inStock;
      return { ...p, inStock: nextStatus, stockCount: nextStatus ? (p.stockCount || 10) : 0 };
    }
    return p;
  });
  saveDatabase(db);
  res.json({ success: true });
});

// Categories API
app.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  const newCategory = {
    ...req.body,
    id: req.body.id || `cat-${Date.now()}`,
  };
  db.categories = [...db.categories, newCategory];
  saveDatabase(db);
  res.status(201).json(newCategory);
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  db.categories = db.categories.filter((c) => c.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// Banners API (Hero Banners managed from Owner Dashboard)
app.get('/api/banners', (req, res) => {
  res.json(db.banners || []);
});

app.post('/api/banners', (req, res) => {
  const newBanner = {
    ...req.body,
    id: req.body.id || `banner-${Date.now()}`,
    active: req.body.active !== undefined ? req.body.active : true,
  };
  db.banners = [...(db.banners || []), newBanner];
  saveDatabase(db);
  res.status(201).json(newBanner);
});

app.put('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body;
  db.banners = (db.banners || []).map((b) => (b.id === id ? { ...b, ...updated } : b));
  saveDatabase(db);
  res.json({ success: true, banner: db.banners.find((b) => b.id === id) });
});

app.delete('/api/banners/:id', (req, res) => {
  const { id } = req.params;
  db.banners = (db.banners || []).filter((b) => b.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

app.post('/api/banners/:id/toggle', (req, res) => {
  const { id } = req.params;
  db.banners = (db.banners || []).map((b) => (b.id === id ? { ...b, active: !b.active } : b));
  saveDatabase(db);
  res.json({ success: true });
});

// Settings API
app.get('/api/settings', (req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json({ success: true, settings: db.settings });
});

// Orders API
app.get('/api/orders', (req, res) => {
  res.json(db.orders);
});

app.post('/api/orders', (req, res) => {
  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder = {
    ...req.body,
    id: `ord-${Date.now()}`,
    orderNumber,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  db.orders = [newOrder, ...db.orders];
  saveDatabase(db);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.orders = db.orders.map((o) => (o.id === id ? { ...o, status } : o));
  saveDatabase(db);
  res.json({ success: true });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  db.orders = db.orders.filter((o) => o.id !== id);
  saveDatabase(db);
  res.json({ success: true });
});

// Secret Owner Authentication Verification API
app.post('/api/auth/verify-owner', (req, res) => {
  const { password } = req.body;
  if (password === '1272000') {
    return res.json({ success: true, message: 'مرحباً بك في لوحة تحكم المالك' });
  }
  return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
});

// Reset database to initial defaults
app.post('/api/reset-data', (req, res) => {
  db = {
    lastUpdated: Date.now(),
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SETTINGS,
    orders: INITIAL_ORDERS,
    banners: INITIAL_BANNERS,
  };
  saveDatabase(db);
  res.json({ success: true });
});

// ----------------- VITE / STATIC SERVING ----------------- //

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`> Al-Mawan Store Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
