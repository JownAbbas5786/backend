const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: 'https://munawar-abbas-frontend.netlify.app/' }));
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage });

const dbFile = process.env.DB_FILE || path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS blogs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover TEXT,
    createdAt TEXT NOT NULL
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_blogs_createdAt ON blogs(createdAt)`);
});

app.get('/', (req, res) => {
  res.send('Blogs API running. Try GET /api/blogs');
});

app.get('/api/blogs', (req, res) => {
  db.all(
    'SELECT id, title, substr(content,1,300) as content, cover, createdAt FROM blogs ORDER BY datetime(createdAt) DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'DB error' });
      res.json(rows);
    }
  );
});

app.get('/api/blogs/:id', (req, res) => {
  db.get('SELECT * FROM blogs WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

app.post('/api/blogs', upload.single('cover'), (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'title and content are required' });
  const id = require('crypto').randomUUID ? require('crypto').randomUUID() : uuidv4();
  const createdAt = new Date().toISOString();
  const coverPath = req.file ? '/uploads/' + req.file.filename : null;
  db.run(
    'INSERT INTO blogs (id, title, content, cover, createdAt) VALUES (?,?,?,?,?)',
    [id, title, content, coverPath, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: 'DB insert error' });
      res.status(201).json({ id, title, content, cover: coverPath, createdAt });
    }
  );
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
