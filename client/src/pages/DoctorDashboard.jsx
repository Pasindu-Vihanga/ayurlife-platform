import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Calendar, Settings, Package, Leaf, Users, Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
);

const DoctorDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [myArticles, setMyArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('appointments');
    const [profileData, setProfileData] = useState({ specialization: '', licenseNumber: '' });
    const [showArticleForm, setShowArticleForm] = useState(false);
    const [articleForm, setArticleForm] = useState({ title: '', content: '', category: 'Remedies', tags: '' });
    const [toast, setToast] = useState('');
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [apptsRes, profileRes, articlesRes] = await Promise.all([
                    api.get('/appointments/doctor'),
                    api.get('/doctors'),
                    api.get('/knowledge/my')
                ]);
                setAppointments(apptsRes.data);
                setMyArticles(articlesRes.data);
                const myProfile = profileRes.data.find(d => d.user._id === userInfo._id);
                if (myProfile) {
                    setDoctorProfile(myProfile);
                    setProfileData({ specialization: myProfile.specialization || '', licenseNumber: myProfile.licenseNumber || '' });
                }
            } catch (error) { console.error('Error fetching data', error); }
            finally { setLoading(false); }
        };
        fetchData();
    }, [userInfo._id]);

    const updateProfileHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/doctors', profileData);
            setDoctorProfile(data);
            setToast('Profile updated successfully!');
            setTimeout(() => setToast(''), 3000);
        } catch (error) { console.error(error); }
    };

    const handleCreateArticle = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/knowledge', articleForm);
            setMyArticles([...myArticles, data]);
            setShowArticleForm(false);
            setArticleForm({ title: '', content: '', category: 'Remedies', tags: '' });
            setToast('Article submitted for review!');
            setTimeout(() => setToast(''), 3000);
        } catch (error) { console.error(error); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative h-14 w-14"><div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping"></div><div className="absolute inset-2 rounded-full border-4 border-t-blue-500 border-transparent animate-spin"></div></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading your console...</p>
        </div>
    );

    const upcomingAppointments = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
    const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right">
                    <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            <div className="relative rounded-[2.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600"></div>
                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="inline-flex items-center gap-2 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                            <Stethoscope size={10} /> Doctor Console
                        </span>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            Dr. <span className="text-blue-100">{userInfo?.name}</span>
                        </h1>
                        <p className="text-white/60 text-sm mt-1 font-medium">{doctorProfile?.specialization || 'Ayurvedic Physician'}</p>
                        {doctorProfile?.isVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-300 text-[10px] font-bold uppercase mt-2"><CheckCircle2 size={12} /> Verified Expert</span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 text-blue-200 text-[10px] font-bold uppercase mt-2"><Clock size={12} /> Verification Pending</span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:min-w-[240px]">
                        <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center text-white">
                            <p className="text-3xl font-black">{upcomingAppointments.length}</p>
                            <p className="text-[9px] font-black uppercase opacity-60 mt-1">Pending Appts</p>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center text-white">
                            <p className="text-3xl font-black">{myArticles.length}</p>
                            <p className="text-[9px] font-black uppercase opacity-60 mt-1">My Articles</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex gap-8 border-b border-gray-100">
                        <button onClick={() => setActiveTab('appointments')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'appointments' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Appointments</button>
                        <button onClick={() => setActiveTab('knowledge')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'knowledge' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Knowledge Base</button>
                    </div>

                    {activeTab === 'appointments' ? (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-black text-gray-800 flex items-center gap-3 mb-6">
                                    <span className="h-8 w-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Calendar size={16} /></span>
                                    Today's Attendance
                                </h2>

                                {upcomingAppointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-14 rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                                        <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 mb-4"><Clock size={28} /></div>
                                        <p className="text-sm text-gray-400 font-semibold italic">No pending appointments in your queue</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {upcomingAppointments.map((appt) => (
                                            <div key={appt._id} className="group p-5 rounded-3xl border border-gray-100 bg-white shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-11 w-11 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-sm">
                                                                {appt.patient?.name?.charAt(0) || 'P'}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-sm font-black text-gray-900">{appt.patient?.name}</h3>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                                            {appt.status}
                                                        </span>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2">
                                                        <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                                                            <span>{new Date(appt.date).toLocaleDateString()}</span>
                                                            <span className="text-gray-800">{appt.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => navigate(`/prescription/${appt._id}`)} className="w-full py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Start Consultation</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-lg font-black text-gray-800 flex items-center gap-3">
                                        <span className="h-8 w-8 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center"><BookOpen size={16} /></span>
                                        Medical Contributions
                                    </h2>
                                    {doctorProfile?.isVerified && (
                                        <button onClick={() => setShowArticleForm(!showArticleForm)} className="bg-violet-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                                            {showArticleForm ? 'Cancel' : 'Write New Article'}
                                        </button>
                                    )}
                                </div>

                                {showArticleForm ? (
                                    <form onSubmit={handleCreateArticle} className="space-y-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100 animate-in slide-in-from-top duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Title</label>
                                                <input type="text" required value={articleForm.title} onChange={e => setArticleForm({ ...articleForm, title: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-violet-400 outline-none" placeholder="Article title..." />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Category</label>
                                                <select value={articleForm.category} onChange={e => setArticleForm({ ...articleForm, category: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-violet-400 outline-none">
                                                    {['Remedies', 'Plants', 'Wellness', 'Daily Routine'].map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Content</label>
                                            <textarea required rows="6" value={articleForm.content} onChange={e => setArticleForm({ ...articleForm, content: e.target.value })} className="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-violet-400 outline-none" placeholder="Share your medical knowledge..." />
                                        </div>
                                        <button type="submit" className="w-full bg-violet-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-violet-100">Submit for Admin Review</button>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        {myArticles.length === 0 ? (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50">
                                                <p className="text-gray-400 text-sm font-black uppercase tracking-widest mb-2">No articles yet</p>
                                                {!doctorProfile?.isVerified && <p className="text-[10px] text-amber-500 font-bold">You need to be verified by admin to write articles.</p>}
                                            </div>
                                        ) : (
                                            myArticles.map(art => (
                                                <div key={art._id} className="p-5 border border-gray-100 rounded-[2rem] hover:bg-violet-50/30 transition-all flex items-center justify-between group">
                                                    <div>
                                                        <h4 className="text-sm font-black text-gray-800 uppercase tracking-tight group-hover:text-violet-700 transition-colors">{art.title}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{art.category} · {new Date(art.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${art.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                        {art.status}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black text-gray-800 mb-6">Medical Profile</h3>
                        <form onSubmit={updateProfileHandler} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Specialization</label>
                                <input type="text" value={profileData.specialization} onChange={e => setProfileData({ ...profileData, specialization: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">License (SLMC)</label>
                                <input type="text" value={profileData.licenseNumber} onChange={e => setProfileData({ ...profileData, licenseNumber: e.target.value })} className="w-full bg-gray-50 border border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none transition-all" />
                            </div>
                            <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">Update Credentials</button>
                        </form>
                    </div>

                    <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100">
                        <Users size={32} className="mb-4 opacity-50" />
                        <h4 className="text-xs font-black uppercase tracking-widest opacity-60">Success Rate</h4>
                        <p className="text-4xl font-black mt-1">98.2%</p>
                        <p className="text-[10px] font-bold mt-2 opacity-60">Based on patient feedback and follow-ups</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
