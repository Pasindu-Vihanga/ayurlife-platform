import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Package, Plus, Beaker, CheckCircle2, ChevronLeft, Trash2, Pencil, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProductionManage = () => {
    const [activeTab, setActiveTab] = useState('batches');
    const [formulations, setFormulations] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // New Batch Form State
    const [newBatchData, setNewBatchData] = useState({
        formulationId: '',
        batchNumber: '',
        quantityProduced: ''
    });

    // New Formulation Form State
    const [newFormulaData, setNewFormulaData] = useState({
        name: '',
        type: 'Oil',
        ingredients: '',
        method: '',
        productionTimeDays: 7
    });

    // Edit Batch State
    const [editingBatch, setEditingBatch] = useState(null);
    const [editBatchData, setEditBatchData] = useState({
        batchNumber: '',
        quantityProduced: ''
    });

    const activeStatuses = ['fermenting', 'processing', 'in-review', 'packaging'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [formulasRes, batchesRes] = await Promise.all([
                    api.get('/production/formulas'),
                    api.get('/production/batches')
                ]);
                setFormulations(formulasRes.data);
                setBatches(batchesRes.data);
            } catch (error) {
                console.error('Error fetching data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBatchSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/production/batches', newBatchData);
            alert('Batch started successfully!');
            // Refresh data
            const { data } = await api.get('/production/batches');
            setBatches(data);
            setActiveTab('batches');
            setNewBatchData({ formulationId: '', batchNumber: '', quantityProduced: '' });
        } catch (error) {
            console.error('Error starting batch', error);
            alert('Failed to start batch');
        }
    };

    const handleFormulaSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert plain string ingredients to array of objects
            const ingredientsArray = newFormulaData.ingredients.split('\n').map(line => {
                const [name, qty] = line.split(':');
                return { name: name?.trim() || 'Ingredient', quantity: qty?.trim() || 'As needed' };
            }).filter(i => i.name);

            await api.post('/production/formulas', { ...newFormulaData, ingredients: ingredientsArray });
            alert('Recipe created successfully!');
            // Refresh data
            const { data } = await api.get('/production/formulas');
            setFormulations(data);
            setActiveTab('recipes');
            setNewFormulaData({ name: '', type: 'Oil', ingredients: '', method: '', productionTimeDays: 7 });
        } catch (error) {
            console.error('Error creating recipe', error);
            alert('Failed to create recipe');
        }
    };

    const handleDeleteBatch = async (batchId) => {
        if (!window.confirm('Are you sure you want to delete this batch?')) return;
        try {
            await api.delete(`/production/batches/${batchId}`);
            // Refresh data
            const { data } = await api.get('/production/batches');
            setBatches(data);
        } catch (error) {
            console.error('Error deleting batch', error);
            alert('Failed to delete batch');
        }
    };

    const handleEditClick = (batch) => {
        setEditingBatch(batch);
        setEditBatchData({
            batchNumber: batch.batchNumber,
            quantityProduced: batch.quantityProduced
        });
    };

    const handleUpdateBatch = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/production/batches/${editingBatch._id}`, editBatchData);
            alert('Batch updated successfully!');
            // Refresh data
            const { data } = await api.get('/production/batches');
            setBatches(data);
            setEditingBatch(null);
        } catch (error) {
            console.error('Error updating batch', error);
            alert('Failed to update batch');
        }
    };

    const handleStatusUpdate = async (batchId, newStatus) => {
        try {
            await api.put(`/production/batches/${batchId}`, { status: newStatus });
            // Refresh data
            const { data } = await api.get('/production/batches');
            setBatches(data);
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status');
        }
    };

    const handleDeleteFormula = async (formulaId) => {
        if (!window.confirm('Are you sure you want to delete this recipe? It cannot be deleted if it has been used in production batches.')) return;
        try {
            await api.delete(`/production/formulas/${formulaId}`);
            alert('Recipe removed successfully!');
            // Refresh data
            const { data } = await api.get('/production/formulas');
            setFormulations(data);
        } catch (error) {
            console.error('Error deleting recipe', error);
            alert(error.response?.data?.message || 'Failed to delete recipe');
        }
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/production" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <ChevronLeft size={20} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-primary tracking-tight">Manage Production</h1>
                            <p className="text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Formulations & Active Batches</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 p-1 bg-gray-100 rounded-2xl w-fit">
                    {[
                        { id: 'batches', label: 'Active Batches', icon: Package },
                        { id: 'recipes', label: 'Recipes & Formulas', icon: Beaker },
                        { id: 'start-batch', label: 'Launch New Batch', icon: Plus }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${activeTab === tab.id
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[600px]">
                    {activeTab === 'batches' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-primary">Active Production Batches</h2>
                                <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                                    {batches.length} Running
                                </span>
                            </div>

                            {batches.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                                    <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-muted font-bold italic">No active production batches found.</p>
                                    <button onClick={() => setActiveTab('start-batch')} className="mt-4 text-primary text-xs font-black uppercase tracking-widest hover:underline">Start your first batch</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {batches.map(batch => (
                                        <div key={batch._id} className="p-6 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-black uppercase tracking-tighter text-muted">Batch ID</span>
                                                    <p className="font-black text-xs text-gray-900">#{batch.batchNumber}</p>
                                                </div>
                                                <select
                                                    value={batch.status}
                                                    onChange={(e) => handleStatusUpdate(batch._id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-100 outline-none transition-all cursor-pointer shadow-sm ${batch.status === 'ready' ? 'bg-green-500 text-white' :
                                                        batch.status === 'bottled' ? 'bg-indigo-500 text-white' :
                                                            batch.status === 'expired' ? 'bg-red-500 text-white' :
                                                                'bg-white text-primary'
                                                        }`}
                                                >
                                                    <option value="fermenting">Fermenting</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="in-review">In Review</option>
                                                    <option value="packaging">Packaging</option>
                                                    <option value="ready">Ready</option>
                                                    <option value="bottled">Bottled</option>
                                                    <option value="expired">Expired</option>
                                                </select>
                                            </div>

                                            <div className="mb-6">
                                                <h3 className="font-black text-lg text-gray-900 line-clamp-1">{batch.formulation?.name}</h3>
                                                <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">{batch.formulation?.type}</p>
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
                                                <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                    <Package size={14} />
                                                    <span>{batch.quantityProduced}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <button
                                                        onClick={() => handleEditClick(batch)}
                                                        className="p-2.5 bg-white text-gray-400 hover:text-primary hover:shadow-md rounded-xl transition-all border border-gray-100"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBatch(batch._id)}
                                                        className="p-2.5 bg-white text-gray-400 hover:text-red-500 hover:shadow-md rounded-xl transition-all border border-gray-100"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'recipes' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Create Recipe Section */}
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-primary">Create New Formula</h2>
                                    <p className="text-xs text-muted font-bold uppercase tracking-widest">Add your secret traditional recipe</p>
                                </div>
                                <form onSubmit={handleFormulaSubmit} className="space-y-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Medicine Name</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Ashwagandha Oil"
                                                value={newFormulaData.name}
                                                onChange={(e) => setNewFormulaData({ ...newFormulaData, name: e.target.value })}
                                                className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 font-bold text-sm focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Type</label>
                                            <select
                                                value={newFormulaData.type}
                                                onChange={(e) => setNewFormulaData({ ...newFormulaData, type: e.target.value })}
                                                className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 font-bold text-sm focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                            >
                                                <option value="Oil">Oil</option>
                                                <option value="Powder">Powder</option>
                                                <option value="Pill">Pill</option>
                                                <option value="Paste">Paste</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Ingredients</label>
                                            <span className="text-[9px] text-primary font-bold">Name: Qty (one per line)</span>
                                        </div>
                                        <textarea
                                            placeholder="Example: \nSandalwood: 250g\nCoconut Oil: 1L"
                                            rows="4"
                                            value={newFormulaData.ingredients}
                                            onChange={(e) => setNewFormulaData({ ...newFormulaData, ingredients: e.target.value })}
                                            className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 font-bold text-sm focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Preparation Method</label>
                                        <textarea
                                            placeholder="Detailed steps..."
                                            rows="4"
                                            value={newFormulaData.method}
                                            onChange={(e) => setNewFormulaData({ ...newFormulaData, method: e.target.value })}
                                            className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 font-bold text-sm focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Production Time (Days)</label>
                                        <input
                                            type="number"
                                            value={newFormulaData.productionTimeDays}
                                            onChange={(e) => setNewFormulaData({ ...newFormulaData, productionTimeDays: e.target.value })}
                                            className="w-full p-4 rounded-2xl bg-white border-2 border-gray-100 font-bold text-sm focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center space-x-2 group">
                                        <Beaker size={18} className="group-hover:rotate-12 transition-transform" />
                                        <span>Save Formula</span>
                                    </button>
                                </form>
                            </div>

                            {/* List Existing Recipes */}
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <h2 className="text-xl font-black text-gray-900">Your Recipe Archive</h2>
                                    <p className="text-xs text-muted font-bold uppercase tracking-widest">Total of {formulations.length} recipes saved</p>
                                </div>

                                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 no-scrollbar">
                                    {formulations.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                            <Beaker size={48} className="mx-auto text-gray-200 mb-4" />
                                            <p className="text-muted font-bold">No recipes saved yet.</p>
                                        </div>
                                    ) : (
                                        formulations.map(f => (
                                            <div key={f._id} className="p-6 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-black text-lg text-gray-900 line-clamp-1">{f.name}</h4>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="px-2 py-0.5 bg-gray-100 text-[8px] font-black text-muted uppercase tracking-widest rounded-md">{f.type}</span>
                                                            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">{f.productionTimeDays} Days</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteFormula(f._id)}
                                                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                                        title="Delete Recipe"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-[9px] font-black uppercase tracking-tighter text-muted mb-2">Key Ingredients</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {f.ingredients.slice(0, 3).map((ing, i) => (
                                                                <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-bold rounded-full">
                                                                    {ing.name}
                                                                </span>
                                                            ))}
                                                            {f.ingredients.length > 3 && (
                                                                <span className="text-[9px] text-muted font-black px-1">+{f.ingredients.length - 3} More</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'start-batch' && (
                        <div className="max-w-xl mx-auto py-8">
                            <h2 className="text-xl font-black text-primary mb-8 text-center">Start New Batch</h2>
                            <form onSubmit={handleBatchSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Select Formulation</label>
                                    <select
                                        value={newBatchData.formulationId}
                                        onChange={(e) => setNewBatchData({ ...newBatchData, formulationId: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    >
                                        <option value="">-- Choose Recipe --</option>
                                        {formulations.map(f => (
                                            <option key={f._id} value={f._id}>{f.name} ({f.type})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Batch Number</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. B-001"
                                            value={newBatchData.batchNumber}
                                            onChange={(e) => setNewBatchData({ ...newBatchData, batchNumber: e.target.value })}
                                            className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Quantity</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 100 Bottles"
                                            value={newBatchData.quantityProduced}
                                            onChange={(e) => setNewBatchData({ ...newBatchData, quantityProduced: e.target.value })}
                                            className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-secondary transition-colors shadow-lg shadow-primary/20 flex items-center justify-center space-x-2">
                                    <Plus size={16} />
                                    <span>Launch Batch</span>
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Edit Batch Modal */}
                {editingBatch && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setEditingBatch(null)}></div>
                        <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Edit Batch</h2>
                                    <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Update details for #{editingBatch.batchNumber}</p>
                                </div>
                                <button onClick={() => setEditingBatch(null)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateBatch} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Batch Number</label>
                                    <input
                                        type="text"
                                        value={editBatchData.batchNumber}
                                        onChange={(e) => setEditBatchData({ ...editBatchData, batchNumber: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Quantity</label>
                                    <input
                                        type="text"
                                        value={editBatchData.quantityProduced}
                                        onChange={(e) => setEditBatchData({ ...editBatchData, quantityProduced: e.target.value })}
                                        className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>

                                <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2">
                                    <CheckCircle2 size={18} />
                                    <span>Save Changes</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProductionManage;
