import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Users, Search, ShoppingBag, Calendar, Clock, Phone, Mail, MapPin } from 'lucide-react';

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Since we don't have a direct /patients endpoint for doctors yet,
                // we'll derive the patient list from the doctor's appointment history.
                const { data } = await api.get('/appointments/doctor');

                const uniquePatients = {};

                data.forEach(appt => {
                    if (appt.patient && !uniquePatients[appt.patient._id]) {
                        uniquePatients[appt.patient._id] = {
                            ...appt.patient,
                            lastVisit: appt.date,
                            totalVisits: 1,
                            latestCondition: appt.reason
                        };
                    } else if (appt.patient) {
                        uniquePatients[appt.patient._id].totalVisits += 1;
                        // Update last visit if this appointment is more recent
                        if (new Date(appt.date) > new Date(uniquePatients[appt.patient._id].lastVisit)) {
                            uniquePatients[appt.patient._id].lastVisit = appt.date;
                            uniquePatients[appt.patient._id].latestCondition = appt.reason;
                        }
                    }
                });

                setPatients(Object.values(uniquePatients));
            } catch (error) {
                console.error('Error fetching patients', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight">My Patients</h1>
                        <p className="text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Managing {patients.length} Unique Profiles</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm focus:ring-2 focus:ring-primary/10 outline-none text-sm font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Patients Grid */}
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <Users size={40} />
                        </div>
                        <p className="text-muted font-bold">No patients found within your records.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => (
                            <div key={patient._id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all group">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl shadow-inner">
                                            {patient.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 leading-tight">{patient.name}</h3>
                                            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">ID: {patient._id.substring(0, 6)}</p>
                                        </div>
                                    </div>
                                    <span className="bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/10">
                                        {patient.totalVisits} Visit{patient.totalVisits !== 1 && 's'}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                                        <Mail size={16} className="text-primary/60" />
                                        <span className="font-medium truncate">{patient.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                                        <Clock size={16} className="text-primary/60" />
                                        <span className="font-medium">Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">Latest Condition</p>
                                        <p className="text-xs font-bold text-gray-800 line-clamp-2">"{patient.latestCondition}"</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-50 flex gap-3">
                                    <button className="flex-1 py-3 bg-gray-50 hover:bg-primary hover:text-white text-gray-700 font-bold text-xs rounded-xl transition-colors">
                                        History
                                    </button>
                                    <button className="flex-1 py-3 bg-primary text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/20 hover:bg-secondary transition-colors">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default DoctorPatients;
