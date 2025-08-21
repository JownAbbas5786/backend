# Backend – Express + SQLite + Multer (Railway-ready)

## Run locally
```bash
npm i
npm start  # http://localhost:3000
```

Endpoints:
- `GET /` – health message
- `GET /api/blogs` – list blogs
- `GET /api/blogs/:id` – single blog
- `POST /api/blogs` – multipart form: fields `title`, `content`, file `cover`

## Railway deploy (quick)
1) Push this **backend/** folder to GitHub.
2) On https://railway.app → New Project → Deploy from GitHub.
3) Set Start Command to `node server.js`. (Root Directory = `backend` if monorepo)
4) After deploy, open your public URL and test.
