import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Package, FlaskConical, CheckCircle2, Plus, Clock } from 'lucide-react';

const ProducerDashboard = () => {
    const [formulas, setFormulas] = useState([]);
    const [batches, setBatches] = useState([]);
    const [myFormulas, setMyFormulas] = useState([]);
    const [myBatches, setMyBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('batches');
    const [subTab, setSubTab] = useState('my');
    const [showBatchForm, setShowBatchForm] = useState(false);
    const [showFormulaForm, setShowFormulaForm] = useState(false);
    const [newBatch, setNewBatch] = useState({ formulationId: '', batchNumber: '', quantityProduced: '' });
    const [newFormula, setNewFormula] = useState({ name: '', type: 'Arishta', ingredients: '', method: '', productionTimeDays: '' });
    const [toast, setToast] = useState('');

    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const [formulasRes, batchesRes, myFormulasRes, myBatchesRes] = await Promise.all([
                api.get('/production/formulas'),
                api.get('/production/batches'),
                api.get('/production/my-formulas'),
                api.get('/production/my-batches'),
            ]);
            setFormulas(formulasRes.data);
            setBatches(batchesRes.data);
            setMyFormulas(myFormulasRes.data);
            setMyBatches(myBatchesRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/production/batches', newBatch);
            showToast('Batch started successfully!');
            setNewBatch({ formulationId: '', batchNumber: '', quantityProduced: '' });
            setShowBatchForm(false);
            fetchData();
        } catch (error) {
            console.error('Error starting batch', error);
            showToast('Failed to start batch. Please try again.');
        }
    };

    const handleFormulaSubmit = async (e) => {
        e.preventDefault();
        try {
            const ingredientsArray = newFormula.ingredients.split(',').map(name => ({
                name: name.trim(),
                quantity: 'As specified'
            }));
            await api.post('/production/formulas', { ...newFormula, ingredients: ingredientsArray });
            showToast('Formula created successfully!');
            setNewFormula({ name: '', type: 'Arishta', ingredients: '', method: '', productionTimeDays: '' });
            setShowFormulaForm(false);
            fetchData();
        } catch (error) {
            console.error('Error creating formula', error);
            showToast('Failed to create formula: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/production/batches/${id}`, { status });
            showToast('Batch status updated.');
            fetchData();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
            <div className="h-12 w-12 rounded-full border-4 border-violet-200 border-t-violet-500 animate-spin"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading production unit...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-violet-600 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-violet-200 animate-in slide-in-from-right">
                    <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            {/* Hero */}
            <div className="relative rounded-[2.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]"></div>
                <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <span className="inline-flex items-center gap-2 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            <FlaskConical size={10} /> Production Unit
                        </span>
                        <h1 className="text-3xl font-black text-white tracking-tight">Medicine Manufacturing</h1>
                        <p className="text-white/60 text-sm mt-1 font-medium">AyurLife Ayurvedic Production Dashboard</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-white/15 backdrop-blur-sm border border-white/20 p-1 rounded-2xl">
                            {['batches', 'formulas'].map(tab => (
                                <button key={tab} onClick={() => { setActiveTab(tab); setSubTab('my'); setShowBatchForm(false); setShowFormulaForm(false); }}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-violet-700 shadow-md' : 'text-white/70 hover:text-white'}`}>
                                    {tab === 'batches' ? 'Batches' : 'Formulations'}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2.5 rounded-2xl">
                            <Package className="text-white/70" size={14} />
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{userInfo?.role}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Batches View */}
            {activeTab === 'batches' && (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                            {[{ id: 'my', label: 'My Batches' }, { id: 'all', label: 'Global Network' }].map(s => (
                                <button key={s.id} onClick={() => setSubTab(s.id)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subTab === s.id ? 'bg-white text-violet-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowBatchForm(!showBatchForm)}
                            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Plus size={14} />{showBatchForm ? 'Cancel' : 'Start New Batch'}
                        </button>
                    </div>

                    {/* New Batch Form */}
                    {showBatchForm && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-violet-100 animate-in slide-in-from-top-4 duration-300">
                            <h3 className="text-sm font-black uppercase tracking-widest text-violet-600 mb-6">Start a New Production Batch</h3>
                            <form onSubmit={handleBatchSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Formulation</label>
                                    <select required value={newBatch.formulationId} onChange={(e) => setNewBatch({ ...newBatch, formulationId: e.target.value })}
                                        className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all">
                                        <option value="">-- Choose Formula --</option>
                                        {myFormulas.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Batch Number</label>
                                    <input type="text" placeholder="e.g. BATCH-2026-001" required value={newBatch.batchNumber} onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                                        className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Quantity (Units)</label>
                                    <input type="number" placeholder="e.g. 500" required value={newBatch.quantityProduced} onChange={(e) => setNewBatch({ ...newBatch, quantityProduced: e.target.value })}
                                        className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all" />
                                </div>
                                <div className="md:col-span-3">
                                    <button type="submit" className="w-full py-4 bg-violet-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all">
                                        Initialize Manufacturing Loop
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Batches Table */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="text-base font-black text-gray-800 flex items-center gap-3">
                                <span className="h-8 w-8 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center"><Package size={16} /></span>
                                {subTab === 'my' ? 'My Production Batches' : 'Global Batch Network'}
                            </h2>
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-3 py-1.5 bg-white border border-gray-100 rounded-full">
                                {(subTab === 'my' ? myBatches : batches).length} Batches
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-left uppercase tracking-widest text-[10px] font-black text-gray-400">
                                        <th className="px-8 py-4">Batch Info</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Started</th>
                                        <th className="px-8 py-4 text-right">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(subTab === 'my' ? myBatches : batches).map((batch) => (
                                        <tr key={batch._id} className="group hover:bg-violet-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-black text-gray-900 text-sm leading-none mb-1">{batch.batchNumber}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{batch.formulation?.name || 'Unknown Formula'}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${batch.status === 'ready' ? 'bg-green-50 text-green-700 border-green-100' : batch.status === 'bottled' ? 'bg-blue-50 text-blue-700 border-blue-100' : batch.status === 'expired' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock size={13} />
                                                    <span className="text-sm font-bold text-gray-700">{new Date(batch.startDate).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <select value={batch.status} onChange={(e) => handleUpdateStatus(batch._id, e.target.value)}
                                                    className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-violet-400/20 outline-none">
                                                    <option value="fermenting">Fermenting</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="bottled">Bottled</option>
                                                    <option value="expired">Expired</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(subTab === 'my' ? myBatches : batches).length === 0 && (
                                <div className="p-20 text-center">
                                    <Package className="mx-auto mb-4 text-gray-200" size={40} />
                                    <p className="text-gray-400 font-bold italic">No manufacturing batches in progress.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Formulas View */}
            {activeTab === 'formulas' && (
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                            {[{ id: 'my', label: 'My Creations' }, { id: 'all', label: 'Public Library' }].map(s => (
                                <button key={s.id} onClick={() => setSubTab(s.id)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subTab === s.id ? 'bg-white text-violet-700 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowFormulaForm(!showFormulaForm)}
                            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-violet-100 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Plus size={14} />{showFormulaForm ? 'Cancel' : 'Create Formula'}
                        </button>
                    </div>

                    {/* New Formula Form */}
                    {showFormulaForm && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-violet-100 animate-in slide-in-from-top-4 duration-300">
                            <h3 className="text-sm font-black uppercase tracking-widest text-violet-600 mb-6">Define a New Formulation</h3>
                            <form onSubmit={handleFormulaSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Medicine Name</label>
                                        <input type="text" placeholder="e.g. Dasamoolarishtaya" required value={newFormula.name} onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })}
                                            className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Type</label>
                                        <select value={newFormula.type} onChange={(e) => setNewFormula({ ...newFormula, type: e.target.value })}
                                            className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all">
                                            <option value="Arishta">Arishta</option>
                                            <option value="Oil">Oil (Thailaya)</option>
                                            <option value="Powder">Powder (Churna)</option>
                                            <option value="Pill">Pill (Guli)</option>
                                            <option value="Paste">Paste (Leha)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Ingredients (comma separated)</label>
                                        <textarea placeholder="Aswagandha Root, Licorice, Ghee, Honey..." required value={newFormula.ingredients} onChange={(e) => setNewFormula({ ...newFormula, ingredients: e.target.value })}
                                            className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all min-h-[80px] resize-none" />
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Manufacturing Method</label>
                                        <textarea placeholder="Step-by-step instructions..." required value={newFormula.method} onChange={(e) => setNewFormula({ ...newFormula, method: e.target.value })}
                                            className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all min-h-[100px] resize-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Production Time (Days)</label>
                                        <input type="number" placeholder="45" required value={newFormula.productionTimeDays} onChange={(e) => setNewFormula({ ...newFormula, productionTimeDays: e.target.value })}
                                            className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-violet-400/20 focus:border-violet-400 outline-none transition-all" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-violet-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-100 hover:bg-violet-700 transition-all">
                                    Register Recipe in Knowledge Base
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Formulas Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(subTab === 'my' ? myFormulas : formulas).map((formula) => (
                            <div key={formula._id} className="group relative bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="absolute top-6 right-6 bg-violet-50 border border-violet-100 px-3 py-1 rounded-full text-[8px] font-black uppercase text-violet-600 tracking-widest">
                                    {formula.type}
                                </div>
                                <div className="h-10 w-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4">
                                    <FlaskConical size={18} />
                                </div>
                                <h3 className="text-lg font-black text-gray-900 mb-3 tracking-tight leading-none pr-16">{formula.name}</h3>
                                <div className="space-y-3 mb-5">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Technique</p>
                                        <p className="text-xs font-medium text-gray-500 line-clamp-2 italic leading-relaxed">"{formula.method}"</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Clock size={12} />
                                        <span className="text-xs font-black text-gray-700">{formula.productionTimeDays} Days</span>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Key Components</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {Array.isArray(formula.ingredients)
                                            ? formula.ingredients.slice(0, 3).map((ing, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-violet-50 border border-violet-100 rounded-lg text-[9px] font-bold text-violet-600">{ing.name || ing}</span>
                                            ))
                                            : formula.ingredients?.split(',').slice(0, 3).map((ing, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-violet-50 border border-violet-100 rounded-lg text-[9px] font-bold text-violet-600">{ing.trim()}</span>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {(subTab === 'my' ? myFormulas : formulas).length === 0 && (
                        <div className="p-20 text-center">
                            <FlaskConical className="mx-auto mb-4 text-gray-200" size={40} />
                            <p className="text-gray-400 font-bold italic">Knowledge base is currently empty.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProducerDashboard;
