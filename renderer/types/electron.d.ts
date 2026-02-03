export interface DiaryEntry {
    id: number;
    title: string;
    content: string;
    mood?: string;
    entry_date: string;
    created_at: string;
}

export interface ElectronAPI {
    getEntries: () => Promise<DiaryEntry[]>;
    saveEntry: (entry: { title: string, content: string, mood: string, entry_date: string }) => Promise<number>;
    deleteEntry: (id: number) => Promise<void>;
    savePDF: (buffer: Uint8Array, filename: string) => Promise<string>;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}
