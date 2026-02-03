import { useState, useEffect } from 'react';
import type { DiaryEntry } from '../types/electron';
import jsPDF from 'jspdf';
import { Book, Calendar, Download, Plus, Save, Trash2, Smile, Frown, Meh, Heart } from 'lucide-react';

export default function Home() {
    const [entries, setEntries] = useState<DiaryEntry[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState('happy');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            setLoading(true);
            setError('');
            const fetchedEntries = await window.electron.getEntries();
            setEntries(fetchedEntries);
        } catch (err) {
            setError('Failed to load entries');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveEntry = async () => {
        if (!title.trim() || !content.trim()) return;

        try {
            setError('');
            await window.electron.saveEntry({
                title,
                content,
                mood,
                entry_date: entryDate
            });
            setTitle('');
            setContent('');
            setMood('happy');
            setEntryDate(new Date().toISOString().split('T')[0]);
            await loadEntries();
        } catch (err) {
            setError('Failed to save entry');
            console.error(err);
        }
    };

    const handleDeleteEntry = async (id: number) => {
        try {
            setError('');
            await window.electron.deleteEntry(id);
            await loadEntries();
        } catch (err) {
            setError('Failed to delete entry');
            console.error(err);
        }
    };

    const handleExportPDF = async () => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(22);
            doc.text("My Personal Diary", 105, 20, { align: "center" });

            doc.setFontSize(12);
            let y = 40;

            entries.forEach((entry, index) => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.text(`${entry.entry_date} - ${entry.title}`, 20, y);
                y += 7;

                doc.setFont("helvetica", "normal");
                const splitContent = doc.splitTextToSize(entry.content, 170);
                doc.text(splitContent, 20, y);

                y += (splitContent.length * 7) + 10;
            });

            const pdfArray = doc.output('arraybuffer');
            await window.electron.savePDF(new Uint8Array(pdfArray), 'diary_export.pdf');
        } catch (error) {
            console.error('PDF Export failed:', error);
            setError('Failed to export PDF');
        }
    };

    const getMoodIcon = (moodType: string) => {
        switch (moodType) {
            case 'sad': return <Frown size={20} className="text-blue-400" />;
            case 'neutral': return <Meh size={20} className="text-yellow-400" />;
            case 'loved': return <Heart size={20} className="text-red-400" />;
            default: return <Smile size={20} className="text-green-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex p-6 gap-6">
            {/* Sidebar / Form */}
            <div className="w-1/3 bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex flex-col h-[calc(100vh-3rem)]">
                <div className="mb-6 flex items-center gap-3">
                    <div className="bg-indigo-600 p-3 rounded-lg">
                        <Book size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">My Diary</h1>
                        <p className="text-slate-400 text-sm">Capture your moments</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Dear Diary..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Date & Mood</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={entryDate}
                                onChange={(e) => setEntryDate(e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 flex-1 outline-none"
                            />
                            <select
                                value={mood}
                                onChange={(e) => setMood(e.target.value)}
                                className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 outline-none"
                            >
                                <option value="happy">Happy</option>
                                <option value="neutral">Neutral</option>
                                <option value="sad">Sad</option>
                                <option value="loved">Loved</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-64 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="What happened today?"
                        />
                    </div>

                    <button
                        onClick={handleSaveEntry}
                        disabled={!title.trim() || !content.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        <Save size={18} />
                        Save Entry
                    </button>
                </div>
            </div>

            {/* Timeline Area */}
            <div className="w-2/3 flex flex-col h-[calc(100vh-3rem)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Calendar size={20} className="text-indigo-400" />
                        Timeline
                    </h2>
                    <button
                        onClick={handleExportPDF}
                        className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                    >
                        <Download size={16} />
                        Export PDF
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading entries...</div>
                    ) : entries.length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-700">
                            <Book size={48} className="mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-400">Your diary is empty. Start writing!</p>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <div key={entry.id} className="relative pl-8 border-l-2 border-slate-700 group">
                                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-slate-900 group-hover:scale-125 transition-transform" />

                                <div className="bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-700 hover:border-indigo-500/30 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-indigo-400 text-sm font-medium block mb-1">
                                                {new Date(entry.entry_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </span>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                {entry.title}
                                                <span title={`Mood: ${entry.mood}`}>{getMoodIcon(entry.mood || 'happy')}</span>
                                            </h3>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteEntry(entry.id)}
                                            className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                        {entry.content}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
