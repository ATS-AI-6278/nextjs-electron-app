import { contextBridge, ipcRenderer } from 'electron';

interface DiaryEntry {
    id: number;
    title: string;
    content: string;
    mood?: string;
    entry_date: string;
    created_at: string;
}

interface IpcResponse<T> {
    success: boolean;
    data?: T;
    id?: number;
    filePath?: string;
    error?: string;
}

// Expose protected methods via contextBridge
contextBridge.exposeInMainWorld('electron', {
    getEntries: async (): Promise<DiaryEntry[]> => {
        const response: IpcResponse<DiaryEntry[]> = await ipcRenderer.invoke('get-entries');
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch entries');
    },

    saveEntry: async (entry: { title: string, content: string, mood: string, entry_date: string }): Promise<number> => {
        const response: IpcResponse<number> = await ipcRenderer.invoke('save-entry', entry);
        if (response.success && response.id !== undefined) {
            return response.id;
        }
        throw new Error(response.error || 'Failed to save entry');
    },

    deleteEntry: async (id: number): Promise<void> => {
        const response: IpcResponse<void> = await ipcRenderer.invoke('delete-entry', id);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete entry');
        }
    },

    savePDF: async (buffer: Uint8Array, filename: string): Promise<string> => {
        const response: IpcResponse<void> = await ipcRenderer.invoke('save-pdf', buffer, filename);
        if (response.success && response.filePath) {
            return response.filePath;
        }
        throw new Error(response.error || 'Failed to save PDF');
    }
});
