import { useState, useEffect } from 'react';
import api, { BASE_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Leaf, Clock, Calendar, ChevronLeft, CheckCircle2, DollarSign, Tag, ImageIcon } from 'lucide-react';

const BookTherapy = () => {
    const [therapies, setTherapies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        therapyId: '',
        date: '',
        time: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTherapies = async () => {
            try {
                const { data } = await api.get('/wellness/therapies');
                setTherapies(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, therapyId: data[0]._id }));
                }
            } catch (error) {
                console.error('Error fetching therapies', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTherapies();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await api.post('/wellness/bookings', formData);
            alert('Therapy Booked Successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error booking therapy', error);
            alert('Failed to book therapy');
        }
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    const selectedTherapy = therapies.find(t => t._id === formData.therapyId);

    return (
        <Layout>
            <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center space-x-2 text-muted hover:text-primary mb-8 font-black text-[10px] uppercase tracking-widest transition-colors group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Overview</span>
                </button>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary/5 border border-gray-100 overflow-hidden">
                    <div className="p-12 border-b border-gray-50 bg-amber-50/30">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-14 w-14 bg-white rounded-3xl flex items-center justify-center text-amber-600 shadow-sm">
                                <Leaf size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-primary tracking-tight">Healing & Rejuvenation</h1>
                                <p className="text-sm text-muted font-bold italic">Schedule your personalized wellness session</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submitHandler} className="p-12 space-y-12">
                        {/* Therapy Selection Grid */}
                        <div className="space-y-6">
                            <label className="block text-[10px] font-black text-muted uppercase tracking-[0.2em]">Select Your Therapy</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {therapies.map((therapy) => (
                                    <label
                                        key={therapy._id}
                                        className={`relative rounded-[2.5rem] border-2 cursor-pointer transition-all duration-300 group overflow-hidden
                                            ${formData.therapyId === therapy._id ? 'border-primary bg-primary/5 shadow-xl scale-[1.02]' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="therapyId"
                                            value={therapy._id}
                                            checked={formData.therapyId === therapy._id}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="h-40 relative overflow-hidden">
                                            {therapy.image ? (
                                                <img src={therapy.image.startsWith('/uploads') ? `${BASE_URL}${therapy.image}` : therapy.image} alt={therapy.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                                                    <Leaf size={48} />
                                                </div>
                                            )}
                                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-primary shadow-sm">
                                                {therapy.category || 'General'}
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{therapy.name}</h3>
                                            </div>
                                            <p className="text-[10px] text-muted font-bold mb-4 line-clamp-2 leading-relaxed">{therapy.description}</p>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-muted">
                                                    <Clock size={12} className="mr-1.5 text-primary" />
                                                    <span>{therapy.durationMinutes}m</span>
                                                </div>
                                                <div className="text-sm font-black text-primary">
                                                    LKR {therapy.price}
                                                </div>
                                            </div>
                                        </div>
                                        {formData.therapyId === therapy._id && (
                                            <div className="absolute top-4 right-4 bg-primary text-white p-1.5 rounded-full shadow-lg">
                                                <CheckCircle2 size={12} />
                                            </div>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Date & Time Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Selection Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-[0.2em] px-1">Preferred Time</label>
                                <div className="relative group">
                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 border-none rounded-2xl py-5 pl-14 pr-5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary & Confirm */}
                        <div className="pt-8 pt-12">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center space-x-3 py-6 bg-primary text-white text-xs font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-primary/20 hover:bg-secondary hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                            >
                                <CheckCircle2 size={18} />
                                <span>Schedule Session</span>
                            </button>
                            <p className="text-center mt-6 text-[10px] font-bold text-muted uppercase tracking-wider italic">
                                Total to pay: <span className="text-primary tracking-tight">LKR {selectedTherapy?.price || '0'}</span> . Payment collected at facility.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default BookTherapy;
