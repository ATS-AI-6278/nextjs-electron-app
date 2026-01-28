import { useState, useEffect } from 'react';
import type { Note } from '../types/electron';

export default function Home() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load notes on mount
    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            setLoading(true);
            setError('');
            const fetchedNotes = await window.electron.getNotes();
            setNotes(fetchedNotes);
        } catch (err) {
            setError('Failed to load notes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNote = async () => {
        if (!newNote.trim()) return;

        try {
            setError('');
            await window.electron.saveNote(newNote);
            setNewNote('');
            await loadNotes();
        } catch (err) {
            setError('Failed to save note');
            console.error(err);
        }
    };

    const handleDeleteNote = async (id: number) => {
        try {
            setError('');
            await window.electron.deleteNote(id);
            await loadNotes();
        } catch (err) {
            setError('Failed to delete note');
            console.error(err);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-dark-bg p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Notes App
                    </h1>
                    <p className="text-gray-400">Simple, fast, and secure note-taking</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}

                {/* New Note Input */}
                <div className="mb-8 bg-dark-card backdrop-blur-sm border border-dark-border rounded-xl p-6 shadow-2xl">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        Create New Note
                    </label>
                    <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                handleSaveNote();
                            }
                        }}
                        placeholder="Type your note here... (Cmd/Ctrl + Enter to save)"
                        className="w-full h-32 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    />
                    <button
                        onClick={handleSaveNote}
                        disabled={!newNote.trim()}
                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    >
                        Save Note
                    </button>
                </div>

                {/* Notes List */}
                <div>
                    <h2 className="text-2xl font-semibold text-white mb-4">
                        Your Notes {!loading && `(${notes.length})`}
                    </h2>

                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center py-16 bg-dark-card border border-dark-border rounded-xl">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-600 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p className="text-gray-400">No notes yet. Create your first note above!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="bg-dark-card backdrop-blur-sm border border-dark-border rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-blue-500/50 group"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white whitespace-pre-wrap break-words mb-3">
                                                {note.content}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {formatDate(note.created_at)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                                            title="Delete note"
                                        >
                                            <svg
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
