# Electron Diary App

A cross-platform desktop diary application built with Electron, Next.js, and SQLite.

## Architecture

- **Frontend**: Next.js (React) with Tailwind CSS - Static exported SPA
- **Backend**: Electron Main Process with SQLite database
- **Database**: better-sqlite3 (runs in Main process only)
- **IPC**: Secure communication via contextBridge in preload script
- **Packaging**: electron-builder for Windows/macOS/Linux

## Getting Started

### Prerequisites

- Node.js 18+
- npm (Node Package Manager)

### Installation

To set up the project, install dependencies. This command includes a postinstall script that automatically downloads and compiles the native modules (like SQLite) for Electron:

```bash
npm install
```

### Development

To start the application in development mode:

```bash
npm run dev
```

This will:
1. Compile TypeScript files for the main process.
2. Start the Next.js development server on `localhost:3000`.
3. Launch the Electron application window.

### Building for Production

To create a distributable installer for your platform:

```bash
npm run dist
```

Artifacts (installers) will be created in the `dist/` directory.

## Project Structure

```
electron-app/
├── main/
│   ├── background.ts    # Electron main process + SQLite logic
│   └── preload.ts       # Secure IPC Bridge
├── renderer/
│   ├── pages/
│   │   └── index.tsx    # Diary Timeline & Entry Form
│   ├── types/
│   │   └── electron.d.ts # TypeScript interfaces
├── package.json         # Scripts and dependencies
└── tsconfig.json        # TypeScript configuration
```

## Database

The SQLite database (`notes.db`) is stored in your operating system's application data folder:

- **Windows**: `C:\Users\<username>\AppData\Roaming\electron-notes-app\notes.db`
- **macOS**: `~/Library/Application Support/electron-notes-app/notes.db`
- **Linux**: `~/.config/electron-notes-app/notes.db`

### Schema

Table: `diary_entries`

| Column      | Type    | Description                  |
| ----------- | ------- | ---------------------------- |
| id          | INTEGER | Primary Key (Auto-increment) |
| title       | TEXT    | Entry Title                  |
| content     | TEXT    | Main entry text              |
| mood        | TEXT    | Mood (happy, sad, etc.)      |
| entry_date  | TEXT    | Date of entry (YYYY-MM-DD)   |
| created_at  | TEXT    | ISO Timestamp of creation    |

## Features

- Create diary entries with Title, Date, and Mood
- Vertical Timeline View (Newest entries first)
- Export entire diary to PDF
- Delete entries
- Persistent SQLite storage
- Dark Mode UI
- Cross-platform support

## Dependencies

- **electron**: Desktop runtime
- **next**: React framework for frontend
- **better-sqlite3**: Fast, native SQLite3 driver
- **jspdf**: Client-side PDF generation
- **lucide-react**: Icon set

## Troubleshooting

### Native Module Errors

If you encounter errors related to `better-sqlite3` or `NODE_MODULE_VERSION` mismatch, simply run:

```bash
npm run postinstall
```

This ensures that native dependencies are rebuilt specifically for the Electron version you are using.
