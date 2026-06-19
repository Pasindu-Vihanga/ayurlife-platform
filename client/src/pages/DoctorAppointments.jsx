import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Calendar, Clock, Search, Filter, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const { data } = await api.get('/appointments/doctor');
                setAppointments(data);
            } catch (error) {
                console.error('Error fetching appointments', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(appt => {
        const matchesStatus = filterStatus === 'all' || appt.status === filterStatus;
        const matchesSearch = appt.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appt.reason.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight">Appointments Manager</h1>
                        <p className="text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Manage your schedule and patient history</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    {/* Controls */}
                    <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search patients or reasons..."
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/10 outline-none text-sm font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            {['all', 'confirmed', 'completed', 'cancelled'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-[10px] uppercase font-black text-muted tracking-widest">
                                <tr>
                                    <th className="px-8 py-4">Patient</th>
                                    <th className="px-8 py-4">Date & Time</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Reason</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAppointments.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-12 text-center text-muted font-bold italic">
                                            No appointments found matching your filters
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAppointments.map((appt) => (
                                        <tr key={appt._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-xs">
                                                        {appt.patient?.name?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{appt.patient?.name}</p>
                                                        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">ID: {appt.patient?._id?.substring(0, 6)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="text-xs font-bold text-gray-700">
                                                    <div className="flex items-center mb-1"><Calendar size={12} className="mr-2 text-primary" /> {new Date(appt.date).toLocaleDateString()}</div>
                                                    <div className="flex items-center"><Clock size={12} className="mr-2 text-primary" /> {appt.time}</div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${appt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                                                        appt.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            appt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <p className="text-xs text-gray-600 font-medium max-w-xs truncate" title={appt.reason}>"{appt.reason}"</p>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                {appt.status !== 'cancelled' && (
                                                    <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                                        View Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DoctorAppointments;
