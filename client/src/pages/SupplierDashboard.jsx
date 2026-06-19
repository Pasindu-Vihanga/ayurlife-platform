import { useState, useEffect } from 'react';
import api, { BASE_URL } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Trash2, Edit, Leaf, Package, CheckCircle2 } from 'lucide-react';

const SupplierDashboard = () => {
    const [inventory, setInventory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory');
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const [newItem, setNewItem] = useState({
        name: '',
        category: 'Raw Herb',
        stock: '',
        unit: 'kg',
        pricePerUnit: '',
        expiryDate: '',
        scientificName: '',
        image: ''
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab') || 'inventory';
        setActiveTab(tab);

        fetchInventory();
        fetchOrders();
        fetchRequests();
    }, [location.search]);

    const fetchInventory = async () => {
        try {
            const { data } = await api.get('/inventory/my');
            setInventory(data);
        } catch (error) {
            console.error('Error fetching inventory', error);
        }
    };

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/requests');
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/supplier');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching supplier orders', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            showToast(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            console.error('Error updating status', error);
            showToast('Failed to update status');
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await api.post('/upload', formData, config);
            setNewItem({ ...newItem, image: data.image });
            showToast('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            showToast(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const [editingId, setEditingId] = useState(null);

    const handleEdit = (item) => {
        setNewItem({
            name: item.name,
            category: item.category,
            stock: item.stock,
            unit: item.unit,
            pricePerUnit: item.pricePerUnit,
            expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
            scientificName: item.scientificName || '',
            image: item.image || ''
        });
        setEditingId(item._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const { data } = await api.put(`/inventory/${editingId}`, newItem);
                setInventory(inventory.map(item => item._id === editingId ? data : item));
                showToast('Item updated successfully');
            } else {
                const { data } = await api.post('/inventory', newItem);
                setInventory([...inventory, data]);
                showToast('Item added successfully');
            }
            setShowForm(false);
            setEditingId(null);
            setNewItem({ name: '', category: 'Raw Herb', stock: '', unit: 'kg', pricePerUnit: '', expiryDate: '', scientificName: '', image: '' });
        } catch (error) {
            console.error('Error saving item', error);
            showToast('Failed to save item');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this item?')) {
            try {
                await api.delete(`/inventory/${id}`);
                setInventory(inventory.filter(item => item._id !== id));
            } catch (error) {
                console.error('Error deleting item', error);
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative h-14 w-14"><div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping"></div><div className="absolute inset-2 rounded-full border-4 border-t-emerald-500 border-transparent animate-spin"></div></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading supplier portal...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200 animate-in slide-in-from-right">
                    <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            {/* Hero */}
            <div className="relative rounded-[2.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]"></div>
                <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <span className="inline-flex items-center gap-2 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            <Leaf size={10} /> {userInfo?.role === 'supplier' ? 'Supplier Portal' : 'Producer Inventory'}
                        </span>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {userInfo?.role === 'supplier' ? 'Herb Supplier' : 'Medicine Producer'}
                        </h1>
                        <p className="text-white/60 text-sm mt-1 font-medium">
                            {userInfo?.role === 'supplier' ? 'Managing raw herbs & inventory' : 'Manage custom products & shop items'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex bg-white/15 backdrop-blur-sm border border-white/20 p-1 rounded-2xl">
                            {['inventory', 'orders', 'requests'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-emerald-700 shadow-md' : 'text-white/70 hover:text-white'}`}>
                                    {tab}{tab === 'orders' && orders.length > 0 ? ` (${orders.length})` : ''}{tab === 'requests' && requests.length > 0 ? ` (${requests.length})` : ''}
                                </button>
                            ))}
                        </div>
                        {activeTab === 'inventory' && (
                            <button
                                onClick={() => { setShowForm(!showForm); if (!showForm) { setEditingId(null); setNewItem({ name: '', category: 'Raw Herb', stock: '', unit: 'kg', pricePerUnit: '', expiryDate: '', scientificName: '', image: '' }); } }}
                                className="flex items-center gap-2 bg-white text-emerald-700 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Plus size={16} /><span>{showForm ? 'View Stock' : 'Add Herb'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Based on Tabs */}
            {activeTab === 'inventory' ? (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-7 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h2 className="text-base font-black text-gray-800 flex items-center gap-3">
                            <span className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Leaf size={16} /></span>
                            Stock Management
                        </h2>
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-3 py-1.5 bg-white border border-gray-100 rounded-full">{inventory.length} Items</span>
                    </div>

                    {showForm && (
                        <div className="p-8 bg-gray-50/30 border-b border-gray-100 animate-in slide-in-from-top-4 duration-300">
                            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 mb-6">{editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
                            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Herb Name</label>
                                    <input type="text" placeholder="e.g. Ashwagandha Root" required value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Scientific Name</label>
                                    <input type="text" placeholder="e.g. Withania somnifera" value={newItem.scientificName} onChange={(e) => setNewItem({ ...newItem, scientificName: e.target.value })} className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Category</label>
                                    <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all">
                                        <option>Raw Herb</option><option>Processed</option><option>Oil</option><option>Other</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Stock Amount</label>
                                    <div className="flex space-x-2">
                                        <input type="number" placeholder="0" required value={newItem.stock} onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })} className="flex-1 bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all" />
                                        <input type="text" placeholder="kg" required value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="w-20 bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all text-center" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Price per Unit</label>
                                    <input type="number" placeholder="LKR" required value={newItem.pricePerUnit} onChange={(e) => setNewItem({ ...newItem, pricePerUnit: e.target.value })} className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Expiry Date</label>
                                    <input type="date" value={newItem.expiryDate} onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })} className="block w-full bg-white border border-gray-200 rounded-2xl py-3 px-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Herb Image</label>
                                    <div>
                                        <input type="file" onChange={uploadFileHandler} className="hidden" id="herb-image-upload" />
                                        <label htmlFor="herb-image-upload" className="block w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-3 px-5 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:border-emerald-400/50 hover:bg-emerald-50/50 transition-all text-gray-400">
                                            {uploading ? 'Uploading...' : newItem.image ? 'Change Image' : 'Select Image'}
                                        </label>
                                        {newItem.image && (
                                            <div className="mt-2 p-2 bg-green-50 rounded-xl border border-green-100 flex items-center space-x-3">
                                                <img src={newItem.image.startsWith('/uploads') ? `${BASE_URL}${newItem.image}` : newItem.image} alt="Preview" className="h-10 w-10 object-cover rounded-lg" />
                                                <span className="text-[10px] font-bold text-green-700 truncate flex-1">{newItem.image}</span>
                                                <button type="button" onClick={() => setNewItem({ ...newItem, image: '' })} className="text-red-500 hover:text-red-700"><Trash2 size={12} /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-end gap-3">
                                    <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="flex-1 py-3 bg-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">Cancel</button>
                                    <button type="submit" disabled={uploading} className="flex-[2] py-3 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all disabled:opacity-60">
                                        {uploading ? 'Wait...' : (editingId ? 'Update' : 'Save')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr className="text-left uppercase tracking-widest text-[10px] font-black text-gray-400">
                                    <th className="px-8 py-4">Herb & Category</th>
                                    <th className="px-8 py-4">Availability</th>
                                    <th className="px-8 py-4">Price per Unit</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inventory.map((item) => (
                                    <tr key={item._id} className="group hover:bg-emerald-50/40 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase overflow-hidden border border-emerald-100">
                                                    {item.image ? <img src={item.image.startsWith('/uploads') ? `${BASE_URL}${item.image}` : item.image} alt={item.name} className="w-full h-full object-cover" /> : item.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 leading-none mb-1">{item.name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border ${item.stock > 10 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                {item.stock} {item.unit} in stock
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-sm text-gray-700">LKR {item.pricePerUnit}</td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {inventory.length === 0 && (
                            <div className="p-20 text-center">
                                <Leaf className="mx-auto mb-4 text-gray-200" size={40} />
                                <p className="text-gray-400 font-bold italic">No inventory items added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : activeTab === 'orders' ? (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-7 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h2 className="text-base font-black text-gray-800 flex items-center gap-3">
                            <span className="h-8 w-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Package size={16} /></span>
                            Incoming Orders
                        </h2>
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-3 py-1.5 bg-white border border-gray-100 rounded-full">{orders.length} Active</span>
                    </div>
                    <div className="overflow-x-auto">
                        {orders.length === 0 ? (
                            <div className="p-20 text-center"><Package className="mx-auto mb-4 text-gray-200" size={40} /><p className="text-gray-400 font-bold italic">No orders received yet.</p></div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-left uppercase tracking-widest text-[10px] font-black text-gray-400">
                                        <th className="px-8 py-4">Customer & Items</th>
                                        <th className="px-8 py-4">Delivery Details</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Update</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-gray-900 mb-1">{order.buyer?.name}</p>
                                                <div className="space-y-0.5">
                                                    {order.items.map((it, idx) => (
                                                        <p key={idx} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">• {it.name} (x{it.quantity})</p>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-bold text-gray-700 max-w-[200px]">{order.shippingAddress}, {order.city}</p>
                                                <p className="text-[10px] font-black text-emerald-600 uppercase mt-1">Tel: {order.phoneNumber}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' : order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <select value={order.status} onChange={(e) => updateOrderStatus(order._id, e.target.value)} className="bg-white border border-gray-200 text-[10px] font-black uppercase px-3 py-2 rounded-xl focus:ring-2 focus:ring-emerald-400/20 outline-none">
                                                    <option value="pending">Pending</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-7 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <h2 className="text-base font-black text-gray-800 flex items-center gap-3">
                            <span className="h-8 w-8 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><Leaf size={16} /></span>
                            Patient Herb Requests
                        </h2>
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-3 py-1.5 bg-white border border-gray-100 rounded-full">
                            {requests.filter(r => r.status === 'Pending').length} Pending
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        {requests.length === 0 ? (
                            <div className="p-20 text-center"><Leaf className="mx-auto mb-4 text-gray-200" size={40} /><p className="text-gray-400 font-bold italic">No requests from patients yet.</p></div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-left uppercase tracking-widest text-[10px] font-black text-gray-400">
                                        <th className="px-8 py-4">Herb Requested</th>
                                        <th className="px-8 py-4">Patient Details</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {requests.map((req) => (
                                        <tr key={req._id} className="group hover:bg-orange-50/30 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-black text-gray-900 mb-1">{req.productName}</p>
                                                <p className="text-xs text-gray-400 font-medium line-clamp-1">{req.details || 'No additional details provided'}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-xs font-bold text-gray-700">{req.patient?.name}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${req.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' : req.status === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {req.status === 'Pending' && (
                                                    <button onClick={() => { setNewItem({ ...newItem, name: req.productName }); setActiveTab('inventory'); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                        className="px-4 py-2 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all">
                                                        Source This Herb
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierDashboard;
