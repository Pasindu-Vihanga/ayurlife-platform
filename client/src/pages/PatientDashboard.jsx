import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
    Calendar, ClipboardList, UserCircle, Clock, Leaf, Tag,
    CheckCircle2, X, ShoppingBag, Activity, Heart, Stethoscope,
    Package, ChevronRight, ArrowUpRight, Sparkles,
    TrendingUp, MapPin, Phone, Home, BookOpen
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className={`relative overflow-hidden rounded-3xl p-5 ${bg} border border-white/40 flex items-center gap-4 group hover:-translate-y-1 transition-all duration-300 shadow-md`}>
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color} bg-white/40 flex-shrink-0`}>
            <Icon size={22} />
        </div>
        <div>
            <p className="text-2xl font-black text-white drop-shadow">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">{label}</p>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={80} />
        </div>
    </div>
);

const TabBtn = ({ label, active, onClick, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap
            ${active
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm'
            }`}
    >
        {Icon && <Icon size={13} />}
        {label}
    </button>
);

const EmptyState = ({ icon: Icon, message, action, actionLabel }) => (
    <div className="flex flex-col items-center justify-center py-14 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/60">
        <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 mb-4">
            <Icon size={26} />
        </div>
        <p className="text-sm text-gray-400 font-semibold italic mb-3">{message}</p>
        {action && (
            <button onClick={action} className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-500 flex items-center gap-1 transition-colors">
                {actionLabel} <ArrowUpRight size={14} />
            </button>
        )}
    </div>
);

const StatusBadge = ({ status }) => {
    const map = {
        confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        completed: 'bg-blue-100 text-blue-700 border-blue-200',
        cancelled: 'bg-red-100 text-red-600 border-red-200',
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        Pending: 'bg-amber-100 text-amber-700 border-amber-200',
        Approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        'In Review': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return (
        <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${map[status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
            {status}
        </span>
    );
};

const PatientDashboard = () => {
    const [patient, setPatient] = useState(null);
    const [wellnessBookings, setWellnessBookings] = useState([]);
    const [availableTherapies, setAvailableTherapies] = useState([]);
    const [orders, setOrders] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [products, setProducts] = useState([]);
    const [productRequests, setProductRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('wellness');
    const [prakruthi, setPrakruthi] = useState('');
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [shippingData, setShippingData] = useState({
        shippingAddress: '', city: '', postalCode: '', phoneNumber: '', paymentMethod: 'Cash on Delivery'
    });
    const [articles, setArticles] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const [appointments, setAppointments] = useState([]);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try { const { data } = await api.get('/patients/me'); setPatient(data); setPrakruthi(data.prakruthi); } catch { }
        try { const { data } = await api.get('/appointments/my'); setAppointments(data); } catch { }
        try { const { data } = await api.get('/wellness/my-bookings'); setWellnessBookings(data); } catch { }
        try { const { data } = await api.get('/wellness/therapies'); setAvailableTherapies(data); } catch { }
        try { const { data } = await api.get('/orders/my'); setOrders(data); } catch { }
        try { const { data } = await api.get('/production/batches'); setProducts(data.filter(b => b.status === 'ready' || b.status === 'bottled')); } catch { }
        try { const { data } = await api.get('/prescriptions/my'); setPrescriptions(data); } catch { }
        try { const { data } = await api.get('/requests/my'); setProductRequests(data); } catch { }
        try { const { data } = await api.get('/knowledge'); setArticles(data.slice(0, 6)); } catch { }
        setLoading(false);
    };

    const updateProfileHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/patients', { prakruthi });
            setPatient(data);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch { alert('Failed to update profile'); }
    };

    const handleBuyProduct = (product) => { setSelectedProduct(product); setShowCheckout(true); };

    const handleConfirmOrder = async (e) => {
        e.preventDefault();
        try {
            await api.post('/orders', {
                items: [{ name: selectedProduct.formulation.name, quantity: 1, price: 2500 }],
                totalAmount: 2500, ...shippingData
            });
            setSuccessMsg('Order placed successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
            setShowCheckout(false); setSelectedProduct(null); fetchData();
        } catch { alert('Failed to place order'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping"></div>
                <div className="absolute inset-2 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading your health data...</p>
        </div>
    );

    const tabs = [
        { id: 'wellness', label: 'Wellness', icon: Leaf },
        { id: 'appointments', label: 'Doctors', icon: Stethoscope },
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
        { id: 'tracker', label: 'Medicine Tracker', icon: Package },
        { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* Success Toast */}
            {successMsg && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 animate-in slide-in-from-right duration-300">
                    <CheckCircle2 size={18} />
                    <span className="text-sm font-bold">{successMsg}</span>
                </div>
            )}

            {/* ─── Hero Header ─── */}
            <div className="relative rounded-[2.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.2),_transparent_70%)]"></div>
                <div className="absolute -top-10 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-teal-300/20 blur-xl"></div>

                <div className="relative z-10 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-white/25 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                                    <Sparkles size={10} /> Patient Portal
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                                Welcome back, <br className="md:hidden" />
                                <span className="text-emerald-100">{userInfo?.name?.split(' ')[0] || 'Patient'}</span>
                            </h1>
                            <p className="text-white/70 text-sm mt-2 font-medium">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            {patient?.prakruthi && patient.prakruthi !== 'Unknown' && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                                    <Leaf size={14} className="text-emerald-100" />
                                    <span className="text-white text-xs font-black uppercase tracking-wider">{patient.prakruthi} Constitution</span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:w-80">
                            <StatCard icon={Calendar} label="Appointments" value={appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length} color="text-white" bg="bg-white/20 backdrop-blur-sm" />
                            <StatCard icon={ClipboardList} label="Prescriptions" value={prescriptions.length} color="text-white" bg="bg-white/20 backdrop-blur-sm" />
                            <StatCard icon={Activity} label="Bookings" value={wellnessBookings.length} color="text-white" bg="bg-white/20 backdrop-blur-sm" />
                            <StatCard icon={ShoppingBag} label="Orders" value={orders.length} color="text-white" bg="bg-white/20 backdrop-blur-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Quick Actions ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Book Doctor', icon: Stethoscope, route: '/book-appointment', gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-purple-200' },
                    { label: 'Wellness Therapy', icon: Heart, route: '/book-therapy', gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-200' },
                    { label: 'Herb Shop', icon: Leaf, route: '/herb-shop', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-200' },
                    { label: 'Log Symptoms', icon: Activity, route: '/symptoms', gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200' },
                ].map(({ label, icon: Icon, route, gradient, shadow }) => (
                    <button
                        key={label}
                        onClick={() => navigate(route)}
                        className={`group relative overflow-hidden bg-gradient-to-br ${gradient} shadow-lg ${shadow} rounded-3xl p-5 flex flex-col items-start gap-3 hover:-translate-y-1 hover:shadow-xl transition-all duration-300`}
                    >
                        <div className="h-10 w-10 bg-white/25 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                            <Icon size={20} />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-white leading-tight">{label}</span>
                        <ChevronRight size={16} className="absolute right-4 bottom-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10 group-hover:bg-white/15 transition-all"></div>
                    </button>
                ))}
            </div>

            {/* ─── Tab Navigation ─── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {tabs.map(t => (
                    <TabBtn key={t.id} label={t.label} icon={t.icon} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
                ))}
            </div>

            {/* ════════════════════════════
                TAB: WELLNESS
            ════════════════════════════ */}
            {activeTab === 'wellness' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400">

                    {/* Prakruthi Card */}
                    <div className="xl:col-span-1 space-y-4">
                        <div className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm">
                            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-50 rounded-full blur-2xl -z-0"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                        <Leaf size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-gray-800">Prakruthi Profile</h2>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ayurvedic Constitution</p>
                                    </div>
                                </div>

                                <form onSubmit={updateProfileHandler} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Body Type</label>
                                        <select
                                            value={prakruthi}
                                            onChange={(e) => setPrakruthi(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all outline-none appearance-none"
                                        >
                                            <option value="Unknown">Not Determined</option>
                                            <option value="Vata">Vata (Air/Ether)</option>
                                            <option value="Pitta">Pitta (Fire/Water)</option>
                                            <option value="Kapha">Kapha (Earth/Water)</option>
                                            <option value="Vata-Pitta">Vata-Pitta</option>
                                            <option value="Pitta-Kapha">Pitta-Kapha</option>
                                            <option value="Vata-Kapha">Vata-Kapha</option>
                                            <option value="Tridosha">Tridosha (Equal Balance)</option>
                                        </select>
                                    </div>

                                    {/* Dosha visual indicator */}
                                    <div className="grid grid-cols-3 gap-2 py-1">
                                        {[
                                            { name: 'Vata', emoji: '🌬️', color: 'bg-blue-50 text-blue-600 border-blue-200', active: prakruthi?.includes('Vata') },
                                            { name: 'Pitta', emoji: '🔥', color: 'bg-orange-50 text-orange-600 border-orange-200', active: prakruthi?.includes('Pitta') },
                                            { name: 'Kapha', emoji: '🌊', color: 'bg-teal-50 text-teal-600 border-teal-200', active: prakruthi?.includes('Kapha') || prakruthi === 'Tridosha' },
                                        ].map(d => (
                                            <div key={d.name} className={`rounded-xl p-2 border text-center transition-all ${d.active ? d.color : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                <div className="text-lg mb-0.5">{d.emoji}</div>
                                                <p className="text-[9px] font-black uppercase tracking-widest">{d.name}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        {patient ? 'Save Changes' : 'Initialize Profile'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Recent Symptoms */}
                        {patient?.symptoms?.length > 0 && (
                            <div className="rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-black text-gray-700 flex items-center gap-2">
                                        <Activity size={16} className="text-rose-500" /> Recent Symptoms
                                    </h3>
                                    <button onClick={() => navigate('/symptoms')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-500 flex items-center gap-1">
                                        View All <ArrowUpRight size={12} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {patient.symptoms.slice(0, 3).map((sym, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-xs font-bold text-gray-600 truncate max-w-[150px]">{sym.log}</p>
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 whitespace-nowrap ml-2">{new Date(sym.date).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Wellness Content */}
                    <div className="xl:col-span-2 space-y-6">
                        {/* Discover Therapies */}
                        <div className="rounded-3xl border border-amber-100 bg-amber-50/50 p-7 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                                    <span className="h-8 w-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Sparkles size={16} /></span>
                                    Healing Therapies
                                </h2>
                                <span className="text-[10px] font-black uppercase text-amber-700 tracking-widest px-3 py-1.5 bg-amber-100 rounded-full border border-amber-200">
                                    {availableTherapies.length} Available
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {availableTherapies.length === 0
                                    ? <EmptyState icon={Leaf} message="No therapies available" />
                                    : availableTherapies.slice(0, 4).map((therapy) => (
                                        <div key={therapy._id} className="group bg-white hover:bg-amber-50 border border-amber-100 hover:border-amber-300 rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:shadow-md">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                                    <Tag size={18} />
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">LKR {therapy.price}</span>
                                            </div>
                                            <h3 className="text-sm font-black text-gray-800 mb-1">{therapy.name}</h3>
                                            <p className="text-[11px] text-gray-400 font-medium mb-4 line-clamp-2">{therapy.description}</p>
                                            <button onClick={() => navigate('/book-therapy')} className="w-full py-2.5 bg-gray-50 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 border border-gray-200 hover:border-transparent text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white rounded-xl transition-all duration-300">
                                                Book Now
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Wellness Schedule */}
                        <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                                    <span className="h-8 w-8 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><Clock size={16} /></span>
                                    Wellness Schedule
                                </h2>
                                <button onClick={() => navigate('/book-therapy')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-500 flex items-center gap-1 transition-colors">
                                    New Booking <ArrowUpRight size={12} />
                                </button>
                            </div>
                            {wellnessBookings.length === 0
                                ? <EmptyState icon={Calendar} message="No therapy sessions scheduled" action={() => navigate('/book-therapy')} actionLabel="Book a session" />
                                : (
                                    <div className="space-y-3">
                                        {wellnessBookings.map((booking) => (
                                            <div key={booking._id} className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 transition-all duration-300">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                                        <Tag size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-800">{booking.therapy?.name}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Calendar size={10} /> {new Date(booking.date).toLocaleDateString()}</span>
                                                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1"><Clock size={10} /> {booking.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <StatusBadge status={booking.status} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════
                TAB: APPOINTMENTS
            ════════════════════════════ */}
            {activeTab === 'appointments' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                                <span className="h-8 w-8 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center"><Stethoscope size={16} /></span>
                                Allocated Doctors
                            </h2>
                            <button onClick={() => navigate('/book-appointment')} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-purple-200 hover:scale-105 transition-transform">
                                + Book New
                            </button>
                        </div>
                        {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').length === 0
                            ? <EmptyState icon={Stethoscope} message="No upcoming appointments" action={() => navigate('/book-appointment')} actionLabel="Book now" />
                            : (
                                <div className="space-y-4">
                                    {appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled').map((apt) => (
                                        <div key={apt._id} className="group rounded-2xl bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 shadow-sm">
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="h-14 w-14 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                                                    <UserCircle size={30} />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-black text-gray-800">Dr. {apt.doctor?.name}</h3>
                                                    <p className="text-[10px] font-bold text-violet-500 mb-2 uppercase tracking-widest">Ayurvedic Specialist</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                                            <Calendar size={10} /> {new Date(apt.date).toLocaleDateString()}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-white px-2 py-1 rounded-lg border border-gray-100">
                                                            <Clock size={10} /> {apt.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 w-full md:w-auto text-right flex-shrink-0">
                                                <StatusBadge status={apt.status} />
                                                <p className="text-[10px] text-gray-400 font-medium">Reason: {apt.reason}</p>
                                                <p className="text-[10px] font-black text-gray-600">
                                                    Payment: <span className={apt.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{apt.paymentStatus?.toUpperCase() || 'PENDING'}</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>

                    {/* History Sidebar */}
                    <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6 h-fit shadow-sm">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                            <TrendingUp size={14} /> Visit History
                        </h3>
                        {appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').length === 0
                            ? <p className="text-xs font-medium text-gray-400 italic">No past visits yet</p>
                            : (
                                <div className="space-y-3">
                                    {appointments.filter(a => a.status === 'completed' || a.status === 'cancelled').map((apt) => (
                                        <div key={apt._id} className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-200 opacity-75 hover:opacity-100 transition-all shadow-sm">
                                            <h4 className="font-black text-gray-700 text-sm">Dr. {apt.doctor?.name}</h4>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[10px] font-bold text-gray-400">{new Date(apt.date).toLocaleDateString()}</span>
                                                <StatusBadge status={apt.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════
                TAB: PRESCRIPTIONS
            ════════════════════════════ */}
            {activeTab === 'prescriptions' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                        <h2 className="text-lg font-black text-gray-800 flex items-center gap-3 mb-6">
                            <span className="h-8 w-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><ClipboardList size={16} /></span>
                            My Prescriptions
                        </h2>
                        {prescriptions.length === 0
                            ? <EmptyState icon={ClipboardList} message="No prescriptions issued yet" />
                            : (
                                <div className="space-y-6">
                                    {prescriptions.map((prescription) => (
                                        <div key={prescription._id} className="rounded-3xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/30 transition-all p-6 md:p-8 shadow-sm">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                                        <UserCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-black text-gray-800">Dr. {prescription.doctor?.name}</h3>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ayurvedic Physician</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                        <Calendar size={12} /> {new Date(prescription.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">Active</span>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl overflow-hidden border border-gray-100 mb-5 shadow-sm">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-gray-100 text-[10px] uppercase font-black text-gray-500 tracking-widest border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-5 py-3">Medicine</th>
                                                            <th className="px-5 py-3">Type</th>
                                                            <th className="px-5 py-3 hidden md:table-cell">Dosage</th>
                                                            <th className="px-5 py-3 hidden md:table-cell">Frequency</th>
                                                            <th className="px-5 py-3">Duration</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100 bg-white">
                                                        {prescription.medicines.map((med, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-5 py-3.5 font-bold text-gray-800 text-sm">{med.name}</td>
                                                                <td className="px-5 py-3.5">
                                                                    <span className="text-[9px] font-black uppercase text-white bg-emerald-500 px-2 py-0.5 rounded-md">{med.type}</span>
                                                                </td>
                                                                <td className="px-5 py-3.5 font-bold text-gray-500 hidden md:table-cell">{med.dosage}</td>
                                                                <td className="px-5 py-3.5 font-bold text-gray-500 hidden md:table-cell">{med.frequency}</td>
                                                                <td className="px-5 py-3.5 font-bold text-gray-500">{med.days}d</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {prescription.instructions && (
                                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-start gap-3">
                                                    <div className="bg-amber-100 text-amber-600 p-1.5 rounded-lg mt-0.5 flex-shrink-0"><ClipboardList size={14} /></div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Doctor's Instructions</h4>
                                                        <p className="text-sm font-medium text-gray-600 italic">"{prescription.instructions}"</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* ════════════════════════════
                TAB: MEDICINE TRACKER
            ════════════════════════════ */}
            {activeTab === 'tracker' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                    {/* Order Tracking */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                        <h2 className="text-lg font-black text-gray-800 flex items-center gap-3 mb-6">
                            <span className="h-8 w-8 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center"><Package size={16} /></span>
                            Track Deliveries
                        </h2>
                        {orders.length === 0
                            ? <EmptyState icon={ShoppingBag} message="No active orders to track" action={() => navigate('/herb-shop')} actionLabel="Browse products" />
                            : (
                                <div className="space-y-6">
                                    {orders.map((order) => {
                                        const steps = [
                                            { key: 'placed', label: 'Placed', icon: CheckCircle2, done: true },
                                            { key: 'shipped', label: 'Shipped', icon: Tag, done: order.status === 'shipped' || order.status === 'delivered' },
                                            { key: 'delivered', label: 'Delivered', icon: Home, done: order.status === 'delivered' },
                                        ];
                                        const progress = order.status === 'pending' ? 15 : order.status === 'shipped' ? 50 : order.status === 'delivered' ? 100 : 0;
                                        return (
                                            <div key={order._id} className="p-6 rounded-3xl border border-gray-100 bg-gray-50 hover:bg-cyan-50/30 transition-all shadow-sm">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-100 gap-3">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600"><ShoppingBag size={20} /></div>
                                                        <div>
                                                            <h4 className="font-black text-gray-800">Order #{order._id.substring(0, 8)}</h4>
                                                            <p className="text-xs text-gray-400 font-bold">{new Date(order.createdAt).toLocaleDateString()} · {order.items.length} Item(s)</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
                                                        <p className="text-xl font-black text-emerald-600">LKR {order.totalAmount?.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <div className="relative flex items-center justify-between px-4 md:px-12 mt-8 mb-4">
                                                    <div className="absolute left-4 md:left-12 right-4 md:right-12 top-4 h-1.5 bg-gray-200 rounded-full -z-10"></div>
                                                    <div className="absolute left-4 md:left-12 top-4 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full -z-10 transition-all duration-1000" style={{ width: `${progress}%`, right: 'auto' }}></div>
                                                    {steps.map((step) => (
                                                        <div key={step.key} className="flex flex-col items-center gap-2">
                                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step.done ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-300 text-white shadow-lg shadow-emerald-200' : 'bg-white border-gray-200 text-gray-300'}`}>
                                                                <step.icon size={14} />
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${step.done ? 'text-gray-700' : 'text-gray-400'}`}>{step.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                    </div>

                    {/* Medicine Requests */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                        <h2 className="text-lg font-black text-gray-800 flex items-center gap-3 mb-6">
                            <span className="h-8 w-8 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><ClipboardList size={16} /></span>
                            My Medicine Requests
                        </h2>
                        {productRequests.length === 0
                            ? <EmptyState icon={Leaf} message="No item requests found" action={() => navigate('/herb-shop')} actionLabel="Request an item" />
                            : (
                                <div className="space-y-3">
                                    {productRequests.map((req) => (
                                        <div key={req._id} className="group flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform"><Leaf size={18} /></div>
                                                <div>
                                                    <h4 className="font-black text-gray-800 text-sm">{req.productName}</h4>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                <StatusBadge status={req.status} />
                                                {req.status === 'Approved' && <p className="text-[9px] font-bold text-emerald-600 animate-pulse">Processing in production...</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>

                    {/* Browse Medicines */}
                    <div className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                                <span className="h-8 w-8 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center"><ShoppingBag size={16} /></span>
                                Browse Medicines
                            </h2>
                            <button onClick={() => navigate('/herb-shop')} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-500 flex items-center gap-1 transition-colors">
                                View All <ArrowUpRight size={12} />
                            </button>
                        </div>
                        {products.length === 0
                            ? <EmptyState icon={Package} message="No products available at the moment" />
                            : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {products.slice(0, 6).map((prod) => (
                                        <div key={prod._id} className="group rounded-3xl border border-gray-100 hover:border-violet-200 bg-white hover:bg-violet-50/30 p-5 flex flex-col hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-100 transition-all duration-300 shadow-sm">
                                            <div className="h-12 w-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform group-hover:bg-violet-200">
                                                <Leaf size={22} />
                                            </div>
                                            <h4 className="font-black text-gray-800 text-sm mb-1">{prod.formulation.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-auto">Batch: {prod.batchNumber}</p>
                                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                                                <span className="text-sm font-black text-gray-800">LKR 2,500</span>
                                                <button
                                                    onClick={() => handleBuyProduct(prod)}
                                                    className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md shadow-purple-200"
                                                >
                                                    Order
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>
            )}
            {/* ════════════════════════════
                TAB: KNOWLEDGE
            ════════════════════════════ */}
            {activeTab === 'knowledge' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Verified Wisdom</h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Explore ancient cures for modern health</p>
                        </div>
                        <button
                            onClick={() => navigate('/knowledge')}
                            className="px-6 py-2.5 bg-white border border-gray-200 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-all flex items-center gap-2 shadow-sm"
                        >
                            Open Library <ArrowUpRight size={14} />
                        </button>
                    </div>

                    {articles.length === 0 ? (
                        <EmptyState icon={BookOpen} message="No wisdom found yet" action={() => navigate('/knowledge')} actionLabel="Go to Knowledge Base" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article) => (
                                <div key={article._id} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 flex flex-col">
                                    <div className="relative h-40 bg-emerald-50 flex items-center justify-center transition-colors group-hover:bg-emerald-100/50">
                                        {article.category === 'Plants' ? <Leaf size={40} className="text-emerald-500" /> : <Sparkles size={40} className="text-emerald-500" />}
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 shadow-sm border border-emerald-100">
                                            {article.category}
                                        </div>
                                    </div>
                                    <div className="p-7 flex-1 flex flex-col space-y-3">
                                        <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{article.title}</h3>
                                        <p className="text-gray-500 text-[13px] line-clamp-3 font-medium flex-1">
                                            {article.content}
                                        </p>
                                        <div className="pt-5 border-t border-gray-50 flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <UserCircle size={14} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Dr. {article.author?.user?.name || 'Expert'}</span>
                                                    <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Expert</span>
                                                </div>
                                            </div>
                                            <button className="h-9 w-9 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-45">
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ─── Checkout Modal ─── */}
            {showCheckout && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCheckout(false)}></div>
                    <div className="relative bg-white border border-gray-100 w-full max-w-lg rounded-[2.5rem] shadow-2xl shadow-gray-200 overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-7 pb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Checkout</h2>
                                    <p className="text-white/70 text-xs font-bold mt-1 uppercase tracking-widest">Cash on Delivery</p>
                                </div>
                                <button onClick={() => setShowCheckout(false)} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all">
                                    <X size={18} className="text-white" />
                                </button>
                            </div>
                            <div className="mt-5 bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between border border-white/30">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white/30 rounded-xl flex items-center justify-center text-white"><Leaf size={20} /></div>
                                    <div>
                                        <h4 className="font-black text-white text-sm">{selectedProduct?.formulation.name}</h4>
                                        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Medicine Order</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest">Total</p>
                                    <p className="text-lg font-black text-white">LKR 2,500</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleConfirmOrder} className="p-7 space-y-5 bg-white">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MapPin size={10} /> Delivery Address</label>
                                <textarea
                                    required value={shippingData.shippingAddress}
                                    onChange={(e) => setShippingData({ ...shippingData, shippingAddress: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-400 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-emerald-400/20 transition-all outline-none min-h-[80px] resize-none"
                                    placeholder="Enter your full street address"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
                                    <input type="text" required value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-400 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-emerald-400/20 transition-all outline-none" placeholder="e.g. Colombo" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Postal Code</label>
                                    <input type="text" required value={shippingData.postalCode} onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-400 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-emerald-400/20 transition-all outline-none" placeholder="00000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Phone size={10} /> Contact Number</label>
                                <input type="tel" required value={shippingData.phoneNumber} onChange={(e) => setShippingData({ ...shippingData, phoneNumber: e.target.value })} className="w-full bg-gray-50 border border-gray-200 focus:border-emerald-400 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-emerald-400/20 transition-all outline-none" placeholder="+94 7X XXX XXXX" />
                            </div>
                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                                <ShoppingBag size={18} /> Confirm Order
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDashboard;
