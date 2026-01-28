import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import * as Database from 'better-sqlite3';

let mainWindow: BrowserWindow | null = null;
let db: Database.Database | null = null;

// Initialize SQLite Database
function initDatabase() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'notes.db');

    console.log('Database path:', dbPath);

    db = new Database(dbPath);

    // Create notes table if it doesn't exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

    console.log('Database initialized successfully');
}

// Create main window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#0f172a',
        show: false,
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../app/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC Handlers
ipcMain.handle('get-notes', async () => {
    try {
        if (!db) throw new Error('Database not initialized');

        const notes = db.prepare('SELECT * FROM notes ORDER BY created_at DESC').all();
        return { success: true, data: notes };
    } catch (error) {
        console.error('Error fetching notes:', error);
        return { success: false, error: (error as Error).message };
    }
});

ipcMain.handle('add-note', async (_event, content: string) => {
    try {
        if (!db) throw new Error('Database not initialized');

        const createdAt = new Date().toISOString();
        const result = db.prepare('INSERT INTO notes (content, created_at) VALUES (?, ?)').run(content, createdAt);

        return { success: true, id: result.lastInsertRowid };
    } catch (error) {
        console.error('Error adding note:', error);
        return { success: false, error: (error as Error).message };
    }
});

ipcMain.handle('delete-note', async (_event, id: number) => {
    try {
        if (!db) throw new Error('Database not initialized');

        db.prepare('DELETE FROM notes WHERE id = ?').run(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting note:', error);
        return { success: false, error: (error as Error).message };
    }
});

// App lifecycle
app.whenReady().then(() => {
    initDatabase();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (db) db.close();
        app.quit();
    }
});

app.on('will-quit', () => {
    if (db) db.close();
});
