import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Leaf, Clock, PlusCircle, ClipboardList, CheckCircle2, UserCircle, Tag, Edit, Trash2 } from 'lucide-react';

const WellnessDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [therapies, setTherapies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTherapyForm, setShowTherapyForm] = useState(false);
    const [newTherapy, setNewTherapy] = useState({ name: '', description: '', durationMinutes: '', price: '', requiredRooms: '' });
    const [editingTherapy, setEditingTherapy] = useState(null);
    const [toast, setToast] = useState('');
    const navigate = useNavigate();

    useEffect(() => { fetchData(); }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const fetchData = async () => {
        try {
            const [bookingsRes, therapiesRes] = await Promise.all([api.get('/wellness/bookings'), api.get('/wellness/therapies')]);
            setBookings(bookingsRes.data); setTherapies(therapiesRes.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleTherapySubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...newTherapy, requiredRooms: typeof newTherapy.requiredRooms === 'string' ? newTherapy.requiredRooms.split(',').map(r => r.trim()) : newTherapy.requiredRooms };
            if (editingTherapy) { await api.put(`/wellness/therapies/${editingTherapy._id}`, payload); showToast('Therapy updated!'); }
            else { await api.post('/wellness/therapies', payload); showToast('New therapy added!'); }
            setNewTherapy({ name: '', description: '', durationMinutes: '', price: '', requiredRooms: '' });
            setEditingTherapy(null); setShowTherapyForm(false); fetchData();
        } catch (error) { console.error(error); }
    };

    const handleEditTherapy = (therapy) => {
        setEditingTherapy(therapy);
        setNewTherapy({ name: therapy.name, description: therapy.description, durationMinutes: therapy.durationMinutes, price: therapy.price, requiredRooms: Array.isArray(therapy.requiredRooms) ? therapy.requiredRooms.join(', ') : '' });
        setShowTherapyForm(true);
    };

    const handleDeleteTherapy = async (id) => {
        if (!window.confirm('Delete this therapy?')) return;
        try { await api.delete(`/wellness/therapies/${id}`); fetchData(); showToast('Therapy deleted'); } catch (error) { console.error(error); }
    };

    const handleStatusUpdate = async (id, status) => {
        try { await api.put(`/wellness/bookings/${id}`, { status }); fetchData(); showToast(`Booking ${status}!`); } catch (error) { console.error(error); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative h-14 w-14"><div className="absolute inset-0 rounded-full border-4 border-teal-100 animate-ping"></div><div className="absolute inset-2 rounded-full border-4 border-t-teal-500 border-transparent animate-spin"></div></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading wellness ops...</p>
        </div>
    );

    const inputCls = "block w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 outline-none transition-all placeholder:text-gray-300";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200 animate-in slide-in-from-right">
                    <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            {/* Hero */}
            <div className="relative rounded-[2.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]"></div>
                <div className="relative z-10 p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div>
                        <span className="inline-flex items-center gap-2 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            <Leaf size={10} /> Wellness Staff Portal
                        </span>
                        <h1 className="text-3xl font-black text-white tracking-tight">Wellness Operations</h1>
                        <p className="text-white/60 text-sm mt-1 font-medium">Managing rejuvenation & healing sessions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                            <p className="text-2xl font-black text-white">{bookings.length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-0.5">Bookings</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-3 text-center">
                            <p className="text-2xl font-black text-white">{therapies.length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mt-0.5">Services</p>
                        </div>
                        <button
                            onClick={() => { if (showTherapyForm) { setEditingTherapy(null); setNewTherapy({ name: '', description: '', durationMinutes: '', price: '', requiredRooms: '' }); } setShowTherapyForm(!showTherapyForm); }}
                            className="flex items-center gap-2 bg-white text-teal-600 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {showTherapyForm ? <><ClipboardList size={16} /> View Schedule</> : <><PlusCircle size={16} /> Add Therapy</>}
                        </button>
                    </div>
                </div>
            </div>

            {showTherapyForm ? (
                /* ── Add/Edit Form ── */
                <div className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="h-10 w-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600"><Leaf size={20} /></div>
                        <h2 className="text-xl font-black text-gray-800">{editingTherapy ? 'Update Therapy' : 'New Therapy Service'}</h2>
                    </div>
                    <form onSubmit={handleTherapySubmit} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Therapy Name</label>
                            <input type="text" required value={newTherapy.name} onChange={(e) => setNewTherapy({ ...newTherapy, name: e.target.value })} className={inputCls} placeholder="e.g. Traditional Abhyanga Massage" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration (Mins)</label>
                                <input type="number" required value={newTherapy.durationMinutes} onChange={(e) => setNewTherapy({ ...newTherapy, durationMinutes: e.target.value })} className={inputCls} placeholder="60" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price (LKR)</label>
                                <input type="number" required value={newTherapy.price} onChange={(e) => setNewTherapy({ ...newTherapy, price: e.target.value })} className={inputCls} placeholder="5000" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                            <textarea value={newTherapy.description} onChange={(e) => setNewTherapy({ ...newTherapy, description: e.target.value })} rows="3" className={`${inputCls} resize-none`} placeholder="Describe the healing benefits..." />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-teal-100 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                {editingTherapy ? 'Save Changes' : 'Launch Service'}
                            </button>
                            {editingTherapy && (
                                <button type="button" onClick={() => { setEditingTherapy(null); setNewTherapy({ name: '', description: '', durationMinutes: '', price: '', requiredRooms: '' }); setShowTherapyForm(false); }} className="px-6 py-4 bg-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            ) : (
                /* ── Bookings + Services ── */
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Bookings Table */}
                    <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-7 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-base font-black text-gray-800 flex items-center gap-3">
                                <span className="h-8 w-8 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center"><Clock size={16} /></span>
                                Daily Schedule
                            </h2>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full">{bookings.length} Sessions</span>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 mb-3"><Clock size={24} /></div>
                                <p className="text-sm text-gray-400 italic font-semibold">No therapy sessions scheduled</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr className="text-left">
                                            {['Time & Session', 'Patient', 'Status', 'Action'].map((col, i) => (
                                                <th key={col} className={`px-7 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 3 ? 'text-right' : ''}`}>{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.map((booking) => (
                                            <tr key={booking._id} className="group hover:bg-teal-50/40 transition-colors">
                                                <td className="px-7 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600"><Tag size={15} /></div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-800">{booking.therapy?.name}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(booking.date).toLocaleDateString()} @ {booking.time}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-7 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><UserCircle size={16} /></div>
                                                        <p className="text-sm font-bold text-gray-700">{booking.patient?.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-7 py-5">
                                                    <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border
                                                        ${booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                                'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-7 py-5 text-right">
                                                    {booking.status === 'pending' && (
                                                        <button onClick={() => handleStatusUpdate(booking._id, 'confirmed')} className="px-4 py-2 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-sm shadow-emerald-100">Confirm</button>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button onClick={() => handleStatusUpdate(booking._id, 'completed')} className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-sm shadow-teal-100">Complete</button>
                                                    )}
                                                    {booking.status === 'completed' && <CheckCircle2 className="text-blue-400 ml-auto" size={20} />}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Services sidebar */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                            <Leaf size={12} /> Active Services
                        </h3>
                        <div className="space-y-3">
                            {therapies.length === 0 ? (
                                <p className="text-xs text-gray-400 italic font-medium">No services yet</p>
                            ) : therapies.map(therapy => (
                                <div key={therapy._id} className="group flex items-center justify-between p-3 hover:bg-teal-50 rounded-2xl border border-transparent hover:border-teal-100 transition-all">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center text-teal-600 transition-colors"><Leaf size={14} /></div>
                                        <div>
                                            <p className="text-xs font-black text-gray-800">{therapy.name}</p>
                                            <p className="text-[9px] font-bold text-teal-600">LKR {therapy.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditTherapy(therapy)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-white rounded-lg shadow-sm transition-all"><Edit size={12} /></button>
                                        <button onClick={() => handleDeleteTherapy(therapy._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg shadow-sm transition-all"><Trash2 size={12} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WellnessDashboard;
