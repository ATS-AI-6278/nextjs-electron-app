# Electron Notes App

A cross-platform desktop note-taking application built with Electron, Next.js, and SQLite.

## 🏗️ Architecture

- **Frontend**: Next.js (React) with Tailwind CSS - Static exported SPA
- **Backend**: Electron Main Process with SQLite database
- **Database**: better-sqlite3 (runs in Main process only)
- **IPC**: Secure communication via contextBridge in preload script
- **Packaging**: electron-builder for Windows/macOS/Linux

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies (includes postinstall script for native modules)
npm install
```

### Development

```bash
# Start development server (Next.js + Electron)
npm run dev
```

This will:
1. Start Next.js dev server on `localhost:3000`
2. Launch Electron app that connects to the dev server

### Building for Production

```bash
# Build Next.js static export + compile TypeScript
npm run build

# Package for current platform
npm run dist

# Or package without creating installer (faster for testing)
npm run pack
```

## 📁 Project Structure

```
electron-app/
├── main/
│   ├── background.ts    # Electron main process + SQLite
│   └── preload.ts       # contextBridge API
├── renderer/
│   ├── pages/
│   │   ├── _app.tsx     # Next.js app wrapper
│   │   └── index.tsx    # Main UI
│   ├── styles/
│   │   └── globals.css  # Tailwind styles
│   ├── types/
│   │   └── electron.d.ts # TypeScript definitions
│   ├── next.config.js   # Static export config
│   └── tsconfig.json
├── app/                 # Next.js build output (git-ignored)
├── dist/                # Electron packaged apps (git-ignored)
├── package.json
└── tsconfig.json
```

## 💾 Database

SQLite database is stored at:

- **Windows**: `C:\Users\<username>\AppData\Roaming\electron-notes-app\notes.db`
- **macOS**: `~/Library/Application Support/electron-notes-app/notes.db`
- **Linux**: `~/.config/electron-notes-app/notes.db`

### Schema

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

## 🔒 Security

- **No Node.js in Renderer**: `nodeIntegration: false`
- **Context Isolation**: `contextIsolation: true`
- **Preload Script**: Safe API exposed via `contextBridge`
- **SQLite in Main Process Only**: Renderer communicates via IPC

## ⚙️ Available Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start development mode         |
| `npm run build` | Build for production           |
| `npm run pack`  | Package without installer      |
| `npm run dist`  | Create distributable installer |

## 🎨 Features

- ✅ Create notes with auto-save timestamp
- ✅ View all notes in chronological order
- ✅ Delete notes
- ✅ Dark theme UI with Tailwind CSS
- ✅ Keyboard shortcuts (Cmd/Ctrl + Enter to save)
- ✅ Persistent SQLite storage
- ✅ Cross-platform (Windows, macOS, Linux)

## 📦 Dependencies

### Production
- `electron` - Desktop app framework
- `next` - React framework
- `react` & `react-dom` - UI library
- `better-sqlite3` - Native SQLite driver
- `electron-is-dev` - Detect dev/prod mode

### Development
- `electron-builder` - App packaging
- `typescript` - Type safety
- `tailwindcss` - Styling
- `concurrently` - Run multiple commands
- `wait-on` - Wait for dev server

## 🐛 Troubleshooting

### Native Module Errors

If you see errors about `better-sqlite3` not loading:

```bash
npm run postinstall
```

This recompiles native modules for your Electron version.

### Development Server Not Starting

Make sure port 3000 is available, or change the port in `package.json`:

```json
"dev:next": "cd renderer && next dev -p 3001"
```

## 📄 License

MIT
