import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Calendar, Clock, MessageSquare, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const BookAppointment = () => {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [availabilityMessage, setAvailabilityMessage] = useState('');
    const [isTimeValid, setIsTimeValid] = useState(true);

    const [formData, setFormData] = useState({
        doctorId: '',
        date: '',
        time: '',
        reason: ''
    });

    // Payment State
    const [paymentData, setPaymentData] = useState({
        cardName: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });
    const [isProcessing, setIsProcessing] = useState(false);

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Consultation Fee (Fixed for now)
    const CONSULTATION_FEE = 2500;

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const { data } = await api.get('/doctors');
                const validDoctors = data.filter(d => d.user && d.user._id);
                setDoctors(validDoctors);
                if (validDoctors.length > 0) {
                    setFormData(prev => ({ ...prev, doctorId: validDoctors[0].user._id }));
                    setSelectedDoctor(validDoctors[0]);
                }
            } catch (error) {
                console.error('Error fetching doctors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // Check Availability when Doctor or Date changes
    useEffect(() => {
        if (!selectedDoctor || !formData.date) {
            setAvailabilityMessage('');
            setIsTimeValid(true);
            return;
        }

        // Create date object from YYYY-MM-DD string in local time
        const [year, month, day] = formData.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        // Find availability for this day
        const dayAvailability = selectedDoctor.availability?.find(
            slot => slot.day === dayName
        );

        if (!dayAvailability || !selectedDoctor.availability || selectedDoctor.availability.length === 0) {
            // Fallback if no specific schedule set, assume 9-5 M-F (optional logic, but let's be strict)
            // Or better: if no schedule set, assume available? Let's say Not Available if strictly defined.
            // But for new system, user might not have set it. 
            // If availability array exists but empty?
            if (selectedDoctor.availability && selectedDoctor.availability.length > 0) {
                setAvailabilityMessage(`Dr. ${selectedDoctor.user.name} is not available on ${dayName}s.`);
                setIsTimeValid(false);
            } else {
                setAvailabilityMessage(''); // Assume available if no schedule set at all
                setIsTimeValid(true);
            }
        } else {
            setAvailabilityMessage(`Available Hours: ${dayAvailability.startTime} - ${dayAvailability.endTime}`);

            // Validate Time if selected
            if (formData.time) {
                if (formData.time < dayAvailability.startTime || formData.time > dayAvailability.endTime) {
                    setIsTimeValid(false);
                } else {
                    setIsTimeValid(true);
                }
            } else {
                setIsTimeValid(true); // Reset to valid until time picked
            }
        }

    }, [formData.date, formData.time, selectedDoctor]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'doctorId') {
            const doc = doctors.find(d => d.user && d.user._id === value);
            setSelectedDoctor(doc || null);
            // Reset date/time on doctor change to force re-validation
            setFormData(prev => ({ ...prev, doctorId: value, date: '', time: '' }));
        }
    };

    const handlePaymentChange = (e) => {
        let value = e.target.value;
        if (e.target.name === 'cardNumber') {
            value = value.replace(/\D/g, '').slice(0, 16);
        } else if (e.target.name === 'expiry') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length >= 2) value = value.slice(0, 2) + '/' + value.slice(2);
        } else if (e.target.name === 'cvc') {
            value = value.replace(/\D/g, '').slice(0, 3);
        }
        setPaymentData({ ...paymentData, [e.target.name]: value });
    };

    const nextStep = (e) => {
        e.preventDefault();

        if (!isTimeValid && availabilityMessage) {
            alert('Please select a valid time within the doctor\'s available hours.');
            return;
        }

        if (!formData.doctorId || !formData.date || !formData.time) {
            alert('Please fill in all required fields');
            return;
        }
        setStep(2);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        setStep(1);
        window.scrollTo(0, 0);
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        // Simulate Payment Processing
        setIsProcessing(true);

        // Simulate a 2-second delay for payment
        setTimeout(async () => {
            try {
                // Prepare payload with payment details
                const payload = {
                    ...formData,
                    paymentStatus: 'paid',
                    paymentMethod: 'card',
                    amount: CONSULTATION_FEE,
                    transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()
                };

                await api.post('/appointments', payload);
                setIsProcessing(false);
                alert('Payment Successful! Appointment Booked.');
                navigate('/dashboard');
            } catch (error) {
                console.error('Error booking appointment', error);
                setIsProcessing(false);
                alert('Payment failed or Server Error');
            }
        }, 2000);
    };

    if (loading) return <Layout><div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div></Layout>;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                    onClick={() => step === 1 ? navigate('/dashboard') : prevStep()}
                    className="flex items-center space-x-2 text-muted hover:text-primary mb-8 font-black text-[10px] uppercase tracking-widest transition-colors group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    <span>{step === 1 ? 'Back to Overview' : 'Back to Details'}</span>
                </button>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-primary/5 border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="p-12 border-b border-gray-50 bg-green-50/30">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="h-14 w-14 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm">
                                {step === 1 ? <Calendar size={28} /> : <div className="text-2xl">💳</div>}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-primary tracking-tight">
                                    {step === 1 ? 'Book Consultation' : 'Secure Payment'}
                                </h1>
                                <p className="text-sm text-muted font-bold italic">
                                    {step === 1 ? 'Select your preferred doctor and time slot' : 'Complete your booking securely'}
                                </p>
                            </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-6 mb-2">
                            <div className={`bg-primary h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                            <span className={step >= 1 ? 'text-primary' : ''}>1. Details</span>
                            <span className={step >= 2 ? 'text-primary' : ''}>2. Payment</span>
                        </div>
                    </div>

                    {step === 1 ? (
                        <form onSubmit={nextStep} className="p-12 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Doctor Selection */}
                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">Select Expert Doctor</label>
                                    <div className="relative">
                                        <select
                                            name="doctorId"
                                            value={formData.doctorId}
                                            onChange={handleChange}
                                            className="block w-full bg-gray-50 border-none rounded-3xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">-- Choose a specialist --</option>
                                            {doctors.map((doc) => doc.user && (
                                                <option key={doc.user._id} value={doc.user._id}>
                                                    Dr. {doc.user.name} ({doc.specialization})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2 font-black flex items-center space-x-2">
                                        <Calendar size={12} className="text-primary" />
                                        <span>Preferred Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="block w-full bg-gray-50 border-none rounded-3xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all"
                                        required
                                    />
                                    {/* Availability Message */}
                                    {availabilityMessage && (
                                        <div className={`flex items-start space-x-2 text-xs font-bold px-2 ${isTimeValid ? 'text-green-600' : 'text-red-500'}`}>
                                            {isTimeValid ? <CheckCircle2 size={14} className="mt-0.5" /> : <AlertCircle size={14} className="mt-0.5" />}
                                            <span>{availabilityMessage}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Time */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2 flex items-center space-x-2">
                                        <Clock size={12} className="text-primary" />
                                        <span>Available Slot</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className={`block w-full bg-gray-50 border-none rounded-3xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 transition-all ${!isTimeValid && formData.time ? 'ring-2 ring-red-500/20 bg-red-50' : 'focus:ring-primary/10'}`}
                                        required
                                    />
                                    {!isTimeValid && formData.time && (
                                        <p className="text-[10px] font-bold text-red-500 px-2">Selected time is outside the doctor's hours.</p>
                                    )}
                                </div>

                                {/* Reason */}
                                <div className="md:col-span-2 space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2 flex items-center space-x-2">
                                        <MessageSquare size={12} className="text-primary" />
                                        <span>Reason for Visit</span>
                                    </label>
                                    <textarea
                                        name="reason"
                                        rows="4"
                                        value={formData.reason}
                                        onChange={handleChange}
                                        className="block w-full bg-gray-50 border-none rounded-[2rem] py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:font-normal"
                                        placeholder="Briefly describe your symptoms or wellness goals..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={!isTimeValid && availabilityMessage !== ''}
                                    className={`w-full flex items-center justify-center space-x-3 py-6 text-xs font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary/20 transition-all duration-300 ${!isTimeValid && availabilityMessage !== '' ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none' : 'bg-primary text-white hover:bg-secondary hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]'}`}
                                >
                                    <span>Proceed to Payment</span>
                                    <ChevronLeft size={18} className="rotate-180" />
                                </button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={submitHandler} className="p-12 space-y-8 animate-in slide-in-from-right-8 duration-500">
                            {/* Order Summary */}
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Appointment Summary</h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Consultation Fee</span>
                                        <span className="font-bold">LKR {CONSULTATION_FEE}.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Service Charge</span>
                                        <span className="font-bold">LKR 0.00</span>
                                    </div>
                                    <div className="border-t border-gray-200 my-2 pt-2 flex justify-between font-black text-lg text-gray-900">
                                        <span>Total</span>
                                        <span>LKR {CONSULTATION_FEE}.00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">Cardholder Name</label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        placeholder="e.g. John Doe"
                                        value={paymentData.cardName}
                                        onChange={handlePaymentChange}
                                        className="block w-full bg-gray-50 border-none rounded-3xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            placeholder="0000 0000 0000 0000"
                                            value={paymentData.cardNumber}
                                            onChange={handlePaymentChange}
                                            maxLength="16"
                                            className="block w-full bg-gray-50 border-none rounded-3xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all"
                                            required
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-xl opacity-50">💳</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">Expiry Date</label>
                                        <input
                                            type="text"
                                            name="expiry"
                                            placeholder="MM/YY"
                                            value={paymentData.expiry}
                                            onChange={handlePaymentChange}
                                            maxLength="5"
                                            className="block w-full bg-gray-50 border-none rounded-3xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">CVC</label>
                                        <input
                                            type="text"
                                            name="cvc"
                                            placeholder="123"
                                            value={paymentData.cvc}
                                            onChange={handlePaymentChange}
                                            maxLength="3"
                                            className="block w-full bg-gray-50 border-none rounded-3xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className={`w-full flex items-center justify-center space-x-3 py-6 text-xs font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-primary/20 transition-all duration-300 ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99]'}`}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white mr-2"></div>
                                            <span>Processing Payment...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            <span>Pay LKR {CONSULTATION_FEE}.00 & Confirm</span>
                                        </>
                                    )}
                                </button>
                                <p className="text-center mt-6 text-[10px] font-bold text-muted uppercase tracking-wider italic">
                                    <span className="flex items-center justify-center gap-2"><span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span> 256-bit SSL Encrypted Payment</span>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BookAppointment;
