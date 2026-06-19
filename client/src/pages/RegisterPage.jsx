import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../services/api';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState('patient');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            navigate(user.role === 'producer' ? '/production' : '/dashboard');
        }
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/users', { name, email, password, role });
            const usedEmails = JSON.parse(localStorage.getItem('usedEmails') || '[]');
            if (!usedEmails.includes(email)) { usedEmails.push(email); localStorage.setItem('usedEmails', JSON.stringify(usedEmails)); }
            alert('Registration Successful! Please login to continue.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { value: 'patient', label: 'Patient', emoji: '🧑‍⚕️' },
        { value: 'doctor', label: 'Doctor', emoji: '👨‍⚕️' },
        { value: 'supplier', label: 'Herb Supplier', emoji: '🌿' },
        { value: 'producer', label: 'Medicine Producer', emoji: '⚗️' },
        { value: 'wellness_staff', label: 'Wellness Staff', emoji: '💆' },
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left panel */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),_transparent_60%)]"></div>
                <div className="absolute -bottom-12 -left-12 h-72 w-72 rounded-full bg-white/5 blur-3xl"></div>
                <div className="relative z-10 flex flex-col justify-center px-14 py-20 text-white">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">🌿</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight">AyurLife</span>
                    </div>
                    <h1 className="text-4xl font-black leading-tight mb-6">
                        Begin Your<br />
                        <span className="text-emerald-100">Healing Journey</span>
                    </h1>
                    <p className="text-white/70 text-base font-medium leading-relaxed max-w-xs">
                        Join thousands finding balance through Ayurvedic wisdom and modern wellness.
                    </p>
                    <div className="mt-10 space-y-3">
                        {['Personalized health profiles', 'Connect with Ayurvedic doctors', 'Track your wellness journey'].map((feat, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm font-bold text-white/80">
                                <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px]">✓</span>
                                </div>
                                {feat}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"><span className="text-xl">🌿</span></div>
                        <span className="text-xl font-black text-gray-800">AyurLife</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create account</h2>
                        <p className="text-gray-400 font-medium mt-2">Start your wellness journey today</p>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                            <input
                                type="text" required
                                className="block w-full px-5 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
                                placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email" required
                                className="block w-full px-5 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
                                placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'} required autoComplete="new-password"
                                    className="block w-full px-5 pr-12 py-3.5 bg-white border border-gray-200 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all placeholder:text-gray-300 text-sm font-medium shadow-sm"
                                    placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-emerald-500 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">I am a...</label>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map(({ value, label, emoji }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setRole(value)}
                                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-bold transition-all text-left
                                            ${role === value
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm shadow-emerald-100'
                                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-base">{emoji}</span>
                                        <span className="text-[11px] font-black">{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
                                <span className="text-red-400">⚠</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
                        >
                            {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><span>Create Account</span><ArrowRight size={16} /></>}
                        </button>

                        <p className="text-sm text-center text-gray-400 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-600 font-black hover:text-emerald-500 transition-colors">Sign in</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
