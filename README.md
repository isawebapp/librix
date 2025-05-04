# Librix

Librix is a Next.js–powered media explorer web application that lets you index and browse files (PDF, MP4, images, etc.) stored on one or more remote HTTP/WebDAV–style servers. You run a small VPS frontend that proxies and catalogs content in SQLite, while storage back-ends live on low-cost shared hosting or any HTTP server.

## Features

- 🔍 **Full-text search** by filename across all backends  
- 📂 **Explorer UI**: navigate folder hierarchies, “Up” button, custom paths  
- 📺 **Inline viewer** for PDFs, images, video (uses HTTP Range requests)  
- 🔄 **Auto-rescan**, manual rescan, or disable scanning per backend  
- ⚙️ **Admin panel**: add/edit/delete backends, name them, configure auth & intervals  
- 🔐 **NextAuth** credentials provider: only admins can manage backends  
- 🛡️ Guests can browse & view files without seeing backend URLs  

## Prerequisites

- **Node.js** ≥16  
- **npm** or **yarn**  
- **VPS** or server with public HTTPS (for production)  
- Shared HTTP/WebDAV storage backends with directory listing enabled  

## Getting Started

1. **Clone the repo**  
```bash
   git clone https://github.com/isawebapp/librix.git
   cd librix
````

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment variables**
   Copy `.env.example` to `.env.local` and fill in:

   ```
   ADMIN_USER=your_admin_username
   ADMIN_PASS=your_admin_password
   NEXTAUTH_SECRET=some_random_long_string
   ```

4. **Run in development**

   ```bash
   npm run dev
   # opens http://localhost:3000
   ```

5. **Build & start production**

   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
librix/
├── .env.local               # your secrets
├── data.db                  # SQLite database (auto-created)
├── next.config.js
├── package.json
├── scripts/
│   └── scanner.ts           # background cron scanner
├── src/
│   ├── utils/
│   │   ├── db.ts            # SQLite schema and connection
│   │   └── scanner.ts       # indexer logic
│   └── app/
│       ├── api/
│       │   ├── auth/[...nextauth]/route.ts
│       │   ├── backends/route.ts
│       │   └── files/
│       │       ├── explorer/route.ts
│       │       ├── search/route.ts
│       │       └── view/route.ts
│       ├── admin/
│       │   ├── page.tsx
│       │   └── admin-client.tsx
│       ├── explorer/page.tsx
│       ├── search/page.tsx
│       ├── viewer/page.tsx
│       ├── nav-bar.tsx
│       ├── layout.tsx
│       └── globals.css
└── tsconfig.json
```

## Configuration

### Backends

* **Name**: human-readable label (defaults to URL if blank)
* **URL**: root of remote directory listing
* **Auth**: optional Basic auth (username & password)
* **Auto-rescan interval**: “Never” or X minutes

### Environment Variables

| Variable          | Description                             |
| ----------------- | --------------------------------------- |
| `ADMIN_USER`      | Admin username for NextAuth credentials |
| `ADMIN_PASS`      | Admin password for NextAuth credentials |
| `NEXTAUTH_SECRET` | Random secret for NextAuth JWT/session  |

## Usage

* **Guest users**

  * Search: `/search?q=filename`
  * Explore: `/explorer?backendId=<ID>&path=/<folder>/`
  * View: `/viewer?backendId=<ID>&path=/file.pdf`

* **Admin users** (after logging in at `/api/auth/signin`)

  * Admin panel: `/admin`
  * Manage storage backends: add, edit, delete, rescan

## API Endpoints

* **`GET /api/backends`**
  Returns `[{ id, name, rescanInterval }]` to everyone.
* **`POST/PUT/DELETE /api/backends`**
  Admin-only: create, update, delete backends.
* **`GET /api/files/search?q=`**
  Public: search for files by name.
* **`GET /api/files/explorer?backendId=&path=`**
  Public: list directory entries.
* **`GET /api/files/view?backendId=&path=`**
  Public: proxy and stream files (supports HTTP Range).

## Security

* Backend URLs are never exposed in client bundle or JSON.
* Guests cannot access admin APIs or see raw URLs.
* Admin panel & mutating routes require NextAuth credentials.

---

Happy exploring with **Librix**! 🚀
