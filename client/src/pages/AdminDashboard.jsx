import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserCheck, Shield, Users, CheckCircle2, MessageSquare, BookOpen, User, QrCode, Leaf } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [articles, setArticles] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');
    const [toast, setToast] = useState('');
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const roles = ['patient', 'doctor', 'supplier', 'producer', 'wellness_staff', 'admin'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersRes, pendingRes, articlesRes, productsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/doctors/pending'),
                api.get('/knowledge/all'),
                api.get('/inventory')
            ]);
            setUsers(usersRes.data);
            setPendingDoctors(pendingRes.data);
            setArticles(articlesRes.data);
            setProducts(productsRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try { const { data } = await api.get('/admin/users'); setUsers(data); }
        catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try { await api.delete(`/admin/users/${id}`); setUsers(users.filter(u => u._id !== id)); }
        catch (error) { console.error('Error deleting user', error); }
    };    const handleRoleChange = async (id, newRole) => {
        try {
            await api.put(`/admin/users/${id}/verify`, { role: newRole });
            setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
            setToast('User role updated!');
            setTimeout(() => setToast(''), 3000);
        } catch (error) { console.error(error); }
    };

    const handleVerifyDoctor = async (id, status) => {
        try {
            await api.put(`/admin/doctors/${id}/verify`, { status });
            setPendingDoctors(pendingDoctors.filter(d => d._id !== id));
            setToast(`Doctor ${status === 'approved' ? 'Verified' : 'Rejected'}!`);
            setTimeout(() => setToast(''), 3000);
            if (status === 'approved') fetchUsers();
        } catch (error) { console.error(error); }
    };

    const handlePublishArticle = async (id) => {
        try {
            await api.put(`/knowledge/${id}/publish`);
            setArticles(articles.map(a => a._id === id ? { ...a, status: 'published' } : a));
            setToast('Article published!');
            setTimeout(() => setToast(''), 3000);
        } catch (error) { console.error(error); }
    };

    const handleDeleteArticle = async (id) => {
        if (!window.confirm('Are you sure you want to delete this article?')) return;
        try {
            await api.delete(`/knowledge/${id}`);
            setArticles(articles.filter(a => a._id !== id));
            setToast('Article deleted!');
            setTimeout(() => setToast(''), 3000);
        } catch (error) {
            console.error('Error deleting article', error);
            setToast('Failed to delete article.');
            setTimeout(() => setToast(''), 3000);
        }
    };


    const handleModerateForum = async (id, status) => {
        try {
            await api.put(`/forum/${id}/moderate`, { status });
            setQuestions(questions.map(q => q._id === id ? { ...q, status } : q));
            setToast(`Forum post ${status}!`);
            setTimeout(() => setToast(''), 3000);
        } catch (error) { console.error(error); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product from the Herb Shop?')) return;
        try {
            await api.delete(`/inventory/${id}`);
            setProducts(products.filter(p => p._id !== id));
            setToast('Product deleted from Herb Shop!');
            setTimeout(() => setToast(''), 3000);
        } catch (error) {
            console.error('Error deleting product', error);
            setToast('Failed to delete product.');
            setTimeout(() => setToast(''), 3000);
        }
    };


    const roleColor = {
        admin: 'bg-violet-100 text-violet-700',
        doctor: 'bg-emerald-100 text-emerald-700',
        wellness_staff: 'bg-amber-100 text-amber-700',
        supplier: 'bg-orange-100 text-orange-700',
        producer: 'bg-teal-100 text-teal-700',
        patient: 'bg-blue-100 text-blue-700',
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative h-14 w-14"><div className="absolute inset-0 rounded-full border-4 border-violet-100 animate-ping"></div><div className="absolute inset-2 rounded-full border-4 border-t-violet-500 border-transparent animate-spin"></div></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading admin panel...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right">
                    <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            <div className="relative rounded-[3rem] overflow-hidden group shadow-xl shadow-violet-100 border border-violet-50">
                {/* Premium Light Glass & Gradients */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-white"></div>
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-multiply"></div>

                {/* Ambient Glowing Orbs */}
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-fuchsia-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-violet-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-60"></div>

                <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    {/* Left: Branding & Titles */}
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2.5 bg-white/60 backdrop-blur-xl border border-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live System Status
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 text-gray-900">
                            System Authority
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base font-medium leading-relaxed max-w-md">
                            Central command center for managing the entire AyurLife ecosystem, access control, and regulatory compliances.
                        </p>
                    </div>

                    {/* Right: Glass Stat Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:min-w-[420px]">
                        {[
                            { label: 'Total Users', value: users.length, icon: Users },
                            { label: 'Articles', value: articles.length, icon: BookOpen },
                            { label: 'Pending Docs', value: pendingDoctors.length, icon: Shield },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="group/card relative overflow-hidden bg-white/60 hover:bg-white backdrop-blur-md border border-violet-100 rounded-[2rem] p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-violet-200/40">
                                <div className="absolute -top-4 -right-4 p-4 opacity-[0.03] group-hover/card:opacity-[0.08] transition-opacity duration-500 transform group-hover/card:scale-110 group-hover/card:rotate-12">
                                    <Icon size={80} className="text-violet-900" />
                                </div>
                                <div className="relative z-10 text-left">
                                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{value}</p>
                                    <div className="h-1 w-6 bg-violet-400 rounded-full mt-4 mb-2 group-hover/card:w-12 transition-all duration-500"></div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-7 pt-7 flex gap-8 border-b border-gray-100 overflow-x-auto">
                    {[
                        { id: 'users', label: 'Access Control' },
                        { id: 'doctors', label: `Verification (${pendingDoctors.length})` },
                        { id: 'knowledge', label: 'Knowledge Base' },
                        { id: 'forum', label: 'Moderation' },
                        { id: 'herbshop', label: `Herb Shop (${products.length})` },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-violet-600 border-b-4 border-violet-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'users' && (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['User Profile', 'Contact Email', 'Access Role', 'Actions'].map((col, i) => (
                                        <th key={col} className={`px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 3 ? 'text-right' : 'text-left'}`}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-violet-50/40 transition-colors group">
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${roleColor[user.role] || 'bg-gray-100 text-gray-600'}`}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black text-gray-800">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-7 py-5 text-sm font-bold text-gray-500">{user.email}</td>
                                        <td className="px-7 py-5">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className="bg-gray-50 border border-gray-200 rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-widest text-gray-700 focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400 outline-none transition-all cursor-pointer disabled:opacity-50"
                                                disabled={user._id === userInfo._id}
                                            >
                                                {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-7 py-5 text-right">
                                            <button
                                                onClick={() => handleDelete(user._id)}
                                                className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 disabled:opacity-30"
                                                disabled={user._id === userInfo._id}
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'doctors' && (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Doctor info', 'License Number', 'Specialization', 'Actions'].map((col, i) => (
                                        <th key={col} className={`px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 3 ? 'text-right' : 'text-left'}`}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {pendingDoctors.length === 0 ? (
                                    <tr><td colSpan="4" className="px-7 py-12 text-center text-sm font-medium text-gray-400">No pending requests</td></tr>
                                ) : (
                                    pendingDoctors.map((doc) => (
                                        <tr key={doc._id} className="hover:bg-violet-50/40 transition-colors">
                                            <td className="px-7 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-800">{doc.user?.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tight">{doc.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-7 py-5"><span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-black rounded-lg">{doc.licenseNumber}</span></td>
                                            <td className="px-7 py-5 text-sm font-bold text-gray-500">{doc.specialization}</td>
                                            <td className="px-7 py-5 text-right space-x-2">
                                                <button onClick={() => handleVerifyDoctor(doc._id, 'rejected')} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl">Reject</button>
                                                <button onClick={() => handleVerifyDoctor(doc._id, 'approved')} className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-100 active:scale-95 transition-all">Approve</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'knowledge' && (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Article Title', 'Author', 'Category', 'Status', 'Actions'].map((col, i) => (
                                        <th key={col} className={`px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'}`}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {articles.length === 0 ? (
                                    <tr><td colSpan="5" className="px-7 py-12 text-center text-sm font-medium text-gray-400">No articles found</td></tr>
                                ) : (
                                    articles.map((art) => (
                                        <tr key={art._id} className="hover:bg-violet-50/40 transition-colors">
                                            <td className="px-7 py-5 text-sm font-black text-gray-800 uppercase tracking-tight">{art.title}</td>
                                            <td className="px-7 py-5 text-sm font-bold text-gray-500">Dr. {art.author?.user?.name}</td>
                                            <td className="px-7 py-5 text-[10px] font-black text-gray-400 uppercase">{art.category}</td>
                                            <td className="px-7 py-5">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${art.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {art.status}
                                                </span>
                                            </td>
                                            <td className="px-7 py-5 text-right space-x-2">
                                                {art.status !== 'published' && (
                                                    <button onClick={() => handlePublishArticle(art._id)} className="px-4 py-2 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-violet-700 active:scale-95 transition-all shadow-lg shadow-violet-100">Publish</button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteArticle(art._id)}
                                                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                                    title="Delete article"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </td>

                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'forum' && (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Thread', 'Asked By', 'Status', 'Actions'].map((col, i) => (
                                        <th key={col} className={`px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 3 ? 'text-right' : 'text-left'}`}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {questions.length === 0 ? (
                                    <tr><td colSpan="4" className="px-7 py-12 text-center text-sm font-medium text-gray-400">No forum activity</td></tr>
                                ) : (
                                    questions.map((q) => (
                                        <tr key={q._id} className="hover:bg-violet-50/40 transition-colors">
                                            <td className="px-7 py-5">
                                                <p className="text-sm font-black text-gray-800 uppercase tracking-tight line-clamp-1">{q.title}</p>
                                                <p className="text-[10px] font-bold text-gray-400 line-clamp-1">{q.description}</p>
                                            </td>
                                            <td className="px-7 py-5 text-sm font-bold text-gray-500">{q.askedBy?.name}</td>
                                            <td className="px-7 py-5">
                                                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${q.status === 'open' ? 'bg-blue-100 text-blue-700' : q.status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {q.status}
                                                </span>
                                            </td>
                                            <td className="px-7 py-5 text-right space-x-2">
                                                <button onClick={() => handleModerateForum(q._id, 'flagged')} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl">Flag</button>
                                                <button onClick={() => handleModerateForum(q._id, 'closed')} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 rounded-xl">Close</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                    {activeTab === 'herbshop' && (
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Product', 'Category', 'Price', 'Stock', 'Supplier', 'Actions'].map((col, i) => (
                                        <th key={col} className={`px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.length === 0 ? (
                                    <tr><td colSpan="6" className="px-7 py-12 text-center text-sm font-medium text-gray-400">No products found</td></tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product._id} className="hover:bg-violet-50/40 transition-colors group">
                                            <td className="px-7 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Leaf size={18} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-800">{product.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 italic">{product.scientificName || '—'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-7 py-4">
                                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-lg uppercase tracking-widest">{product.category}</span>
                                            </td>
                                            <td className="px-7 py-4 text-sm font-black text-primary">LKR {product.pricePerUnit}</td>
                                            <td className="px-7 py-4">
                                                <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${product.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${product.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                                                    {product.stock} {product.unit}
                                                </span>
                                            </td>
                                            <td className="px-7 py-4 text-sm font-bold text-gray-500">{product.supplier?.name || '—'}</td>
                                            <td className="px-7 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                                    title="Delete product"
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
