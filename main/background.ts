import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import Database from 'better-sqlite3';

let mainWindow: BrowserWindow | null = null;
let db: Database.Database | null = null;

// Initialize SQLite Database
function initDatabase() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'notes.db');

    console.log('Database path:', dbPath);

    db = new Database(dbPath);

    // Create diary_entries table if it doesn't exist
    db.exec(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      mood TEXT,
      entry_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
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
ipcMain.handle('get-entries', async () => {
    try {
        if (!db) throw new Error('Database not initialized');

        const entries = db.prepare('SELECT * FROM diary_entries ORDER BY entry_date DESC, created_at DESC').all();
        return { success: true, data: entries };
    } catch (error) {
        console.error('Error fetching entries:', error);
        return { success: false, error: (error as Error).message };
    }
});

ipcMain.handle('save-entry', async (_event, entry: { title: string, content: string, mood: string, entry_date: string }) => {
    try {
        if (!db) throw new Error('Database not initialized');

        const createdAt = new Date().toISOString();
        const result = db.prepare(
            'INSERT INTO diary_entries (title, content, mood, entry_date, created_at) VALUES (?, ?, ?, ?, ?)'
        ).run(entry.title, entry.content, entry.mood, entry.entry_date, createdAt);

        return { success: true, id: result.lastInsertRowid };
    } catch (error) {
        console.error('Error adding entry:', error);
        return { success: false, error: (error as Error).message };
    }
});

ipcMain.handle('delete-entry', async (_event, id: number) => {
    try {
        if (!db) throw new Error('Database not initialized');

        db.prepare('DELETE FROM diary_entries WHERE id = ?').run(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting entry:', error);
        return { success: false, error: (error as Error).message };
    }
});

ipcMain.handle('save-pdf', async (_event, buffer: Buffer, filename: string) => {
    try {
        const { filePath } = await dialog.showSaveDialog({
            defaultPath: filename,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });

        if (filePath) {
            require('fs').writeFileSync(filePath, buffer);
            return { success: true, filePath };
        }
        return { success: false, error: 'User cancelled' };
    } catch (error) {
        console.error('Error saving PDF:', error);
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
