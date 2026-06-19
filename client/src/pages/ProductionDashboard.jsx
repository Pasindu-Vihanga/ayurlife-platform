import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Package, ClipboardList, AlertCircle, CheckCircle2, FlaskConical, Plus, X, Camera, DollarSign, Layers, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductionDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        activeBatches: 0,
        pendingRequests: 0,
        lowStockAlerts: 0
    });
    const [recentBatches, setRecentBatches] = useState([]);
    const [productRequests, setProductRequests] = useState([]);

    // Completion Modal State
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [completionData, setCompletionData] = useState({
        price: 2500,
        stock: 50,
        image: '/uploads/default-medicine.jpg'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Batches
                const { data: batches } = await api.get('/production/batches');
                const active = batches.filter(b => b.status !== 'ready').length;
                setRecentBatches(batches.slice(0, 5));

                // Fetch Requests
                const { data: requests } = await api.get('/requests');
                const pending = requests.filter(r => r.status === 'Pending').length;
                setProductRequests(requests);

                setStats({
                    activeBatches: active,
                    pendingRequests: pending,
                    lowStockAlerts: 3 // Mock data for now
                });
            } catch (error) {
                console.error('Error fetching production data', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStatusUpdate = async (requestId, newStatus) => {
        if (newStatus === 'Completed') {
            setSelectedRequest(requestId);
            setShowCompletionModal(true);
            return;
        }

        try {
            await api.put(`/requests/${requestId}`, { status: newStatus });
            // Refresh requests
            const { data: requests } = await api.get('/requests');
            setProductRequests(requests);

            // Update stats
            const pending = requests.filter(r => r.status === 'Pending').length;
            setStats(prev => ({ ...prev, pendingRequests: pending }));
        } catch (error) {
            console.error('Error updating status', error);
            alert('Failed to update status');
        }
    };

    const handleCompletionSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/requests/${selectedRequest}`, {
                status: 'Completed',
                ...completionData
            });

            // Refresh requests
            const { data: requests } = await api.get('/requests');
            setProductRequests(requests);

            // Update stats
            const pending = requests.filter(r => r.status === 'Pending').length;
            setStats(prev => ({ ...prev, pendingRequests: pending }));

            setShowCompletionModal(false);
            alert('Request marked as Completed and added to Herb Shop Inventory!');
        } catch (error) {
            console.error('Error completing request', error);
            alert('Failed to complete request');
        }
    };

    const handleDeleteBatch = async (batchId) => {
        if (!window.confirm('Are you sure you want to remove this production batch?')) return;
        try {
            await api.delete(`/production/batches/${batchId}`);
            // Refresh batches
            const { data: batches } = await api.get('/production/batches');
            const active = batches.filter(b => b.status !== 'ready').length;
            setRecentBatches(batches.slice(0, 5));
            setStats(prev => ({ ...prev, activeBatches: active }));
        } catch (error) {
            console.error('Error deleting batch', error);
            alert('Failed to delete batch');
        }
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight">Production Unit</h1>
                        <p className="text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Manage Manufacturing & Requests</p>
                    </div>
                    <Link to="/production/manage" className="flex items-center space-x-2 px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                        <FlaskConical size={16} />
                        <span>Manage Batches</span>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <FlaskConical size={32} />
                        </div>
                        <div>
                            <span className="text-3xl font-black text-gray-900">{stats.activeBatches}</span>
                            <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Active Batches</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <ClipboardList size={32} />
                        </div>
                        <div>
                            <span className="text-3xl font-black text-gray-900">{stats.pendingRequests}</span>
                            <p className="text-[10px] uppercase font-bold text-muted tracking-widest">New Requests</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
                            <AlertCircle size={32} />
                        </div>
                        <div>
                            <span className="text-3xl font-black text-gray-900">{stats.lowStockAlerts}</span>
                            <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Low Stock Alerts</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Patient Requests */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full">
                        <h2 className="text-xl font-black text-primary mb-6 flex items-center space-x-2">
                            <ClipboardList size={24} />
                            <span>Patient Requests</span>
                        </h2>
                        <div className="space-y-4">
                            {productRequests.length === 0 ? (
                                <p className="text-muted text-sm font-bold text-center py-8">No pending requests</p>
                            ) : (
                                productRequests.map(req => (
                                    <div key={req._id} className="p-5 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between hover:bg-white hover:border-primary/20 hover:shadow-md transition-all group gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{req.productName}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${req.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                    req.status === 'Approved' ? 'bg-green-100 text-green-600' :
                                                        req.status === 'In Review' ? 'bg-blue-100 text-blue-600' :
                                                            'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-muted font-bold mt-1 uppercase tracking-widest">Requested by: {req.patient?.name || 'Unknown'}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <select
                                                value={req.status}
                                                onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                                                className="bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-600 transition-all focus:ring-2 focus:ring-primary/10 outline-none"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Review">In Review</option>
                                                <option value="Approved">Approved</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Batches */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full">
                        <h2 className="text-xl font-black text-primary mb-6 flex items-center space-x-2">
                            <Package size={24} />
                            <span>Recent Production</span>
                        </h2>
                        <div className="space-y-4">
                            {recentBatches.length === 0 ? (
                                <div className="text-center py-12">
                                    <FlaskConical size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-muted text-sm font-bold">No active batches</p>
                                    <Link to="/production/manage" className="inline-block mt-4 text-primary text-xs font-black uppercase tracking-widest hover:underline">Start a Batch</Link>
                                </div>
                            ) : (
                                recentBatches.map(batch => (
                                    <div key={batch._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group/batch">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{batch.formulation?.name || 'Unknown Formula'}</h3>
                                            <p className="text-xs text-muted font-bold mt-1">Batch #{batch.batchNumber}</p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${batch.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                {batch.status}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteBatch(batch._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover/batch:opacity-100"
                                                title="Delete Batch"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Completion Modal */}
            {showCompletionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowCompletionModal(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Finalize Product</h2>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Set store details for Herb Shop</p>
                            </div>
                            <button onClick={() => setShowCompletionModal(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCompletionSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2 flex items-center">
                                    <DollarSign size={12} className="mr-1" /> Sale Price (LKR)
                                </label>
                                <input
                                    type="number"
                                    value={completionData.price}
                                    onChange={(e) => setCompletionData({ ...completionData, price: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2 flex items-center">
                                    <Layers size={12} className="mr-1" /> Initial Stock
                                </label>
                                <input
                                    type="number"
                                    value={completionData.stock}
                                    onChange={(e) => setCompletionData({ ...completionData, stock: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2 flex items-center">
                                    <Camera size={12} className="mr-1" /> Product Image Link/Path
                                </label>
                                <input
                                    type="text"
                                    placeholder="/uploads/my-medicine.jpg"
                                    value={completionData.image}
                                    onChange={(e) => setCompletionData({ ...completionData, image: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 group">
                                <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Complete & Post to Shop</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default ProductionDashboard;
