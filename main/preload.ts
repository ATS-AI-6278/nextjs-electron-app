import { contextBridge, ipcRenderer } from 'electron';

interface Note {
    id: number;
    content: string;
    created_at: string;
}

interface IpcResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Expose protected methods via contextBridge
contextBridge.exposeInMainWorld('electron', {
    getNotes: async (): Promise<Note[]> => {
        const response: IpcResponse<Note[]> = await ipcRenderer.invoke('get-notes');
        if (response.success && response.data) {
            return response.data;
        }
        throw new Error(response.error || 'Failed to fetch notes');
    },

    saveNote: async (content: string): Promise<number> => {
        const response: IpcResponse<number> = await ipcRenderer.invoke('add-note', content);
        if (response.success && response.id !== undefined) {
            return response.id as number;
        }
        throw new Error(response.error || 'Failed to save note');
    },

    deleteNote: async (id: number): Promise<void> => {
        const response: IpcResponse<void> = await ipcRenderer.invoke('delete-note', id);
        if (!response.success) {
            throw new Error(response.error || 'Failed to delete note');
        }
    },
});
