import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Settings, Globe, Mail, AlertTriangle, Save, CheckCircle, Shield, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: '',
        contactEmail: '',
        maintenanceMode: false,
        announcement: '',
        allowRegistrations: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings');
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSettingsUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/admin/settings', settings);
            alert('Site settings updated successfully');
        } catch (error) {
            console.error('Error updating settings', error);
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    return (
        <Layout>
            <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 hover:text-primary transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-primary tracking-tight">Site Configuration</h1>
                            <p className="text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Global System Preferences</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
                        <Shield size={18} className="text-purple-600" />
                        <span className="text-sm font-black text-gray-700">{userInfo?.name}</span>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-12 shadow-xl shadow-primary/5">
                    <form onSubmit={handleSettingsUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Application Name</label>
                            <div className="relative">
                                <Globe size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="block w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                                    placeholder="AyurLife"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Contact Email</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                    className="block w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                                    placeholder="support@ayurlife.com"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Global Announcement Banner</label>
                            <textarea
                                value={settings.announcement}
                                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                                rows="4"
                                className="block w-full bg-gray-50 border-none rounded-2xl py-6 px-8 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300 leading-relaxed"
                                placeholder="Important: System maintenance scheduled for Sunday midnight..."
                            />
                        </div>

                        <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-red-100 transition-all">
                            <div className="flex items-center space-x-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${settings.maintenanceMode ? 'bg-red-100 text-red-600 shadow-lg shadow-red-100' : 'bg-white text-gray-300 shadow-sm'}`}>
                                    <AlertTriangle size={24} className={settings.maintenanceMode ? 'animate-bounce' : ''} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Maintenance Mode</p>
                                    <p className="text-[10px] font-bold text-muted mt-0.5">Disables public access for all non-admin users</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                className={`w-16 h-8 rounded-full p-1 transition-all duration-300 ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}
                            >
                                <div className={`h-6 w-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${settings.maintenanceMode ? 'translate-x-8' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-primary/20 transition-all">
                            <div className="flex items-center space-x-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${settings.allowRegistrations ? 'bg-primary/10 text-primary shadow-lg shadow-primary/5' : 'bg-white text-gray-300 shadow-sm'}`}>
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Public Registration</p>
                                    <p className="text-[10px] font-bold text-muted mt-0.5">Control if new visitors can create accounts</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings({ ...settings, allowRegistrations: !settings.allowRegistrations })}
                                className={`w-16 h-8 rounded-full p-1 transition-all duration-300 ${settings.allowRegistrations ? 'bg-primary' : 'bg-gray-200'}`}
                            >
                                <div className={`h-6 w-6 bg-white rounded-full shadow-md transition-all duration-300 transform ${settings.allowRegistrations ? 'translate-x-8' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="md:col-span-2 pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center space-x-4 bg-primary text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                ) : (
                                    <Save size={20} />
                                )}
                                <span>Update System Settings</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default AdminSettings;
