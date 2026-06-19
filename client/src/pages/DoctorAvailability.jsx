import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { Clock, Calendar, Check, Save } from 'lucide-react';

const DoctorAvailability = () => {
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState({
        Monday: { active: false, start: '09:00', end: '17:00' },
        Tuesday: { active: false, start: '09:00', end: '17:00' },
        Wednesday: { active: false, start: '09:00', end: '17:00' },
        Thursday: { active: false, start: '09:00', end: '17:00' },
        Friday: { active: false, start: '09:00', end: '17:00' },
        Saturday: { active: false, start: '09:00', end: '13:00' },
        Sunday: { active: false, start: '09:00', end: '13:00' }
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/doctors');
                // Filter client-side for now as we don't have /me endpoint
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const myProfile = data.find(d => d.user._id === userInfo._id);

                if (myProfile && myProfile.availability) {
                    const newSchedule = { ...schedule };
                    myProfile.availability.forEach(slot => {
                        if (newSchedule[slot.day]) {
                            newSchedule[slot.day] = {
                                active: true,
                                start: slot.startTime,
                                end: slot.endTime
                            };
                        }
                    });
                    setSchedule(newSchedule);
                }
            } catch (error) {
                console.error('Error fetching profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleToggle = (day) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], active: !prev[day].active }
        }));
    };

    const handleTimeChange = (day, field, value) => {
        setSchedule(prev => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleSave = async () => {
        try {
            const availabilityArray = Object.entries(schedule)
                .filter(([_, data]) => data.active)
                .map(([day, data]) => ({
                    day,
                    startTime: data.start,
                    endTime: data.end
                }));

            await api.post('/doctors', { availability: availabilityArray });
            alert('Schedule updated successfully!');
        } catch (error) {
            console.error('Error updating schedule', error);
            alert('Failed to update schedule');
        }
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in run duration-500">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-primary tracking-tight">Practice Availability</h1>
                        <p className="text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Set your weekly consultation hours</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="space-y-6">
                        {Object.entries(schedule).map(([day, data]) => (
                            <div key={day} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${data.active ? 'bg-white border-green-100 shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => handleToggle(day)}
                                        className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${data.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-transparent'}`}
                                    >
                                        <Check size={14} strokeWidth={4} />
                                    </button>
                                    <span className={`text-sm font-black uppercase tracking-wider w-24 ${data.active ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                        <Clock size={14} className="text-gray-400" />
                                        <input
                                            type="time"
                                            value={data.start}
                                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                                            disabled={!data.active}
                                            className="bg-transparent text-xs font-bold text-gray-900 outline-none disabled:text-gray-400"
                                        />
                                    </div>
                                    <span className="text-gray-300 font-black">-</span>
                                    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                        <Clock size={14} className="text-gray-400" />
                                        <input
                                            type="time"
                                            value={data.end}
                                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                                            disabled={!data.active}
                                            className="bg-transparent text-xs font-bold text-gray-900 outline-none disabled:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="flex items-center space-x-2 px-8 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <Save size={16} />
                            <span>Save Schedule</span>
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default DoctorAvailability;
