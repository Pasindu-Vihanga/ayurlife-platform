import { useState, useEffect } from 'react';
import api from '../services/api';
import { ClipboardList, Plus, Activity, Calendar, Trash2, CheckCircle2 } from 'lucide-react';
import Layout from '../components/Layout';

const Symptoms = () => {
    const [symptoms, setSymptoms] = useState([]);
    const [newSymptom, setNewSymptom] = useState('');
    const [severity, setSeverity] = useState('Mild');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/patients/me');
            if (data?.symptoms) {
                setSymptoms(data.symptoms.sort((a, b) => new Date(b.date) - new Date(a.date)));
            }
        } catch (error) { console.error('Error fetching symptoms', error); }
        finally { setLoading(false); }
    };

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newSymptom.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await api.post('/patients/symptoms', { log: newSymptom, severity });
            setSymptoms(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setNewSymptom(''); setSeverity('Mild');
            showToast('Symptom logged successfully!');
        } catch (error) { console.error(error); }
        finally { setSubmitting(false); }
    };

    const handleDelete = async (index) => {
        if (!window.confirm('Delete this symptom log?')) return;
        try {
            const { data } = await api.delete(`/patients/symptoms/${index}`);
            setSymptoms(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
            showToast('Deleted successfully');
        } catch (error) { console.error(error); }
    };

    const severityConfig = {
        High: { bg: 'bg-red-100 text-red-700 border-red-200', active: 'bg-red-500 text-white border-red-500 shadow-red-100' },
        Medium: { bg: 'bg-amber-100 text-amber-700 border-amber-200', active: 'bg-amber-500 text-white border-amber-500 shadow-amber-100' },
        Mild: { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', active: 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-100' },
    };

    if (loading) return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="relative h-14 w-14"><div className="absolute inset-0 rounded-full border-4 border-rose-100 animate-ping"></div><div className="absolute inset-2 rounded-full border-4 border-t-rose-500 border-transparent animate-spin"></div></div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading health records...</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500 pb-12 max-w-6xl mx-auto">
                {/* Toast */}
                {toast && (
                    <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200 animate-in slide-in-from-right">
                        <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                    </div>
                )}

                {/* Hero */}
                <div className="relative rounded-[2.5rem] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]"></div>
                    <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
                        <div>
                            <span className="inline-flex items-center gap-2 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                                <Activity size={10} /> Health Tracker
                            </span>
                            <h1 className="text-3xl font-black text-white tracking-tight">Symptom Log</h1>
                            <p className="text-white/60 text-sm mt-1 font-medium">Track and monitor your daily health journey</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
                            <p className="text-4xl font-black text-white">{symptoms.length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-1">Recorded Entries</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Log Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 sticky top-8">
                            <h2 className="text-base font-black text-gray-800 flex items-center gap-3 mb-6">
                                <span className="h-8 w-8 bg-rose-100 text-rose-500 rounded-xl flex items-center justify-center"><Plus size={17} /></span>
                                Log New Symptom
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">How do you feel?</label>
                                    <textarea
                                        required value={newSymptom} onChange={(e) => setNewSymptom(e.target.value)} rows="4"
                                        className="block w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 outline-none transition-all resize-none placeholder:text-gray-300"
                                        placeholder="Describe your symptom in detail..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Severity Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Mild', 'Medium', 'High'].map((level) => (
                                            <button
                                                key={level} type="button" onClick={() => setSeverity(level)}
                                                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm
                                                    ${severity === level ? severityConfig[level].active : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="submit" disabled={submitting}
                                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Save Log'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* History */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-base font-black text-gray-800 flex items-center gap-3">
                            <span className="h-8 w-8 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center"><ClipboardList size={16} /></span>
                            Symptom History
                        </h2>

                        {symptoms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/60">
                                <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 mb-4"><Activity size={28} /></div>
                                <p className="text-sm text-gray-400 font-semibold italic mb-1">No symptoms logged yet</p>
                                <p className="text-[11px] text-gray-300 font-medium">Start by logging how you feel today</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {symptoms.map((item, index) => (
                                    <div key={index} className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <p className="text-gray-800 font-medium text-sm leading-relaxed flex-1 mr-4 italic">"{item.log}"</p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${severityConfig[item.severity]?.bg || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                    {item.severity}
                                                </span>
                                                <button
                                                    onClick={() => handleDelete(index)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-xl hover:bg-red-50 text-gray-300 hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-[10px] font-bold text-gray-400 gap-1">
                                            <Calendar size={11} />
                                            {new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Symptoms;
