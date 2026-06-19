import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Plus, Trash2, Stethoscope, CheckCircle2, ArrowLeft } from 'lucide-react';

const CreatePrescription = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [medicines, setMedicines] = useState([{ name: '', type: 'Pill', dosage: '', frequency: 'Morning/Night', days: 7 }]);
    const [instructions, setInstructions] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                const { data } = await api.get('/appointments/doctor');
                const appt = data.find(a => a._id === appointmentId);
                if (appt) { setAppointment(appt); }
                else { navigate('/dashboard'); }
            } catch (error) { console.error(error); }
            finally { setLoading(false); }
        };
        fetchAppointment();
    }, [appointmentId, navigate]);

    const handleMedicineChange = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const addMedicine = () => setMedicines([...medicines, { name: '', type: 'Pill', dosage: '', frequency: 'Morning/Night', days: 7 }]);
    const removeMedicine = (index) => setMedicines(medicines.filter((_, i) => i !== index));

    const submitHandler = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/prescriptions', { appointmentId, medicines, instructions });
            setToast('Prescription sent successfully!');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (error) {
            console.error(error);
            setToast('Failed to send prescription');
        } finally { setSubmitting(false); }
    };

    const inputCls = "block w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium text-gray-800 focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300";
    const labelCls = "block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2";

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
            <div className="relative h-14 w-14"><div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping"></div><div className="absolute inset-2 rounded-full border-4 border-t-blue-500 border-transparent animate-spin"></div></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading appointment...</p>
        </div>
    );

    if (!appointment) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400 font-bold italic">Appointment not found.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200 animate-in slide-in-from-right">
                    <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            <div className="w-full max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
                {/* Back */}
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors mb-2">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                {/* Hero */}
                <div className="relative rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]"></div>
                    <div className="relative z-10 p-7 flex items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-2 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
                                <Stethoscope size={10} /> Prescribe
                            </span>
                            <h1 className="text-2xl font-black text-white tracking-tight">New Prescription</h1>
                        </div>
                        <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-white text-base">
                                    {appointment.patient?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">{appointment.patient?.name}</p>
                                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Patient</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Complaint */}
                <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 flex items-start gap-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                        <Stethoscope size={15} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Chief Complaint</p>
                        <p className="text-sm font-bold text-blue-800 italic">"{appointment.reason}"</p>
                    </div>
                </div>

                {/* Prescription Form */}
                <form onSubmit={submitHandler} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Medicines Header */}
                    <div className="p-7 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-base font-black text-gray-800">Medicines to Prescribe</h2>
                        <button type="button" onClick={addMedicine} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all">
                            <Plus size={14} /> Add Medicine
                        </button>
                    </div>

                    {/* Medicine Rows */}
                    <div className="p-7 space-y-4">
                        {medicines.map((med, index) => (
                            <div key={index} className="bg-gray-50/80 border border-gray-100 rounded-3xl p-5 relative group animate-in fade-in duration-300">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">#{index + 1}</span>
                                    {medicines.length > 1 && (
                                        <button type="button" onClick={() => removeMedicine(index)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-12">
                                    <div className="col-span-2 md:col-span-2">
                                        <label className={labelCls}>Medicine Name</label>
                                        <input type="text" required value={med.name} onChange={(e) => handleMedicineChange(index, 'name', e.target.value)} className={inputCls} placeholder="e.g. Ashwagandha" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Type</label>
                                        <select value={med.type} onChange={(e) => handleMedicineChange(index, 'type', e.target.value)} className={inputCls}>
                                            {['Pill', 'Decoction', 'Powder', 'Oil', 'Arishta'].map(t => <option key={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Dosage</label>
                                        <input type="text" required value={med.dosage} onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)} className={inputCls} placeholder="2 pills" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className={labelCls}>Frequency</label>
                                        <input type="text" required value={med.frequency} onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)} className={inputCls} placeholder="Morning/Night" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Days</label>
                                        <input type="number" required min="1" value={med.days} onChange={(e) => handleMedicineChange(index, 'days', e.target.value)} className={inputCls} placeholder="7" />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Instructions */}
                        <div className="mt-4">
                            <label className={labelCls}>Additional Instructions / Lifestyle Advice</label>
                            <textarea rows="4" value={instructions} onChange={(e) => setInstructions(e.target.value)} className={`${inputCls} resize-none`} placeholder="e.g. Avoid cold foods, Practice Pranayama daily, rest well..." />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-7 pt-0 flex items-center justify-end gap-3">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-gray-200 transition-all">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100">
                            {submitting ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Stethoscope size={14} /><span>Issue Prescription</span></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePrescription;
