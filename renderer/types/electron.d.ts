export interface Note {
    id: number;
    content: string;
    created_at: string;
}

export interface ElectronAPI {
    getNotes: () => Promise<Note[]>;
    saveNote: (content: string) => Promise<number>;
    deleteNote: (id: number) => Promise<void>;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
