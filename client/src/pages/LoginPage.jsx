import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Star, Leaf } from 'lucide-react';
import api from '../services/api';

// Feature images (Unsplash – stable URLs, no auth required)
const FEATURES = [
    {
        img: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=400&q=80',
        title: 'Expert Doctors',
        desc: 'Board-certified Ayurvedic physicians at your fingertips'
    },
    {
        img: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400&q=80',
        title: 'Pure Herb Shop',
        desc: 'Ethically sourced herbs & wellness products'
    },
    {
        img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
        title: 'Holistic Wellness',
        desc: 'Personalised wellness plans & mindful living'
    }
];

const TESTIMONIALS = [
    { name: 'Niluka P.', role: 'Patient', text: 'AyurLife transformed my health. My Vata imbalance was resolved in weeks!', stars: 5 },
    { name: 'Dr. Saman K.', role: 'Physician', text: 'The platform makes reaching patients and sharing knowledge effortless.', stars: 5 },
];

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [usedEmails, setUsedEmails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('usedEmails') || '[]');
        setUsedEmails(history);
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) navigate('/dashboard');

        // Auto-rotate testimonials
        const timer = setInterval(() => setActiveTestimonial(p => (p + 1) % TESTIMONIALS.length), 4000);
        return () => clearInterval(timer);
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/users/login', { email, password });
            const history = JSON.parse(localStorage.getItem('usedEmails') || '[]');
            if (!history.includes(email)) { history.push(email); localStorage.setItem('usedEmails', JSON.stringify(history)); }
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-950">
            {/* ── LEFT PANEL ───────────────────────────── */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col">

                {/* Full-bleed background image */}
                <img
                    src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=85"
                    alt="Ayurvedic herbs"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-emerald-950/75 to-gray-900/60" />
                {/* Decorative glows */}
                <div className="absolute top-24 right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-[80px]" />
                <div className="absolute bottom-32 left-16 w-56 h-56 bg-teal-400/20 rounded-full blur-[60px]" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full px-14 py-14">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="h-11 w-11 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-2xl flex items-center justify-center">
                            <Leaf size={20} className="text-emerald-300" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-white">AyurLife</span>
                        <span className="ml-auto text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Trusted Platform
                        </span>
                    </div>

                    {/* Hero text */}
                    <div className="mt-auto">
                        <p className="text-emerald-400 text-[11px] font-black uppercase tracking-widest mb-4">
                            Ancient Wisdom · Modern Care
                        </p>
                        <h1 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
                            Your Wellness<br />
                            Journey<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300">
                                Starts Here
                            </span>
                        </h1>
                        <p className="text-white/60 text-base font-medium leading-relaxed max-w-sm mb-10">
                            Sri Lanka's premier integrated Ayurvedic health platform — connecting patients, physicians, and suppliers.
                        </p>

                        {/* Feature cards with real images */}
                        <div className="grid grid-cols-3 gap-3 mb-10">
                            {FEATURES.map(({ img, title, desc }) => (
                                <div key={title} className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-emerald-400/40 transition-all duration-500 cursor-default">
                                    <img src={img} alt={title} className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/50 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-white text-[11px] font-black leading-tight">{title}</p>
                                        <p className="text-white/50 text-[9px] font-medium leading-tight mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Testimonial */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 transition-all duration-500">
                            <div className="flex mb-2">
                                {Array(TESTIMONIALS[activeTestimonial].stars).fill(0).map((_, i) => (
                                    <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                                ))}
                            </div>
                            <p className="text-white/80 text-sm font-medium italic leading-relaxed mb-3">
                                "{TESTIMONIALS[activeTestimonial].text}"
                            </p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white text-xs font-black">{TESTIMONIALS[activeTestimonial].name}</p>
                                    <p className="text-white/40 text-[10px]">{TESTIMONIALS[activeTestimonial].role}</p>
                                </div>
                                <div className="flex gap-1.5">
                                    {TESTIMONIALS.map((_, i) => (
                                        <button key={i} onClick={() => setActiveTestimonial(i)} className={`w-5 h-1.5 rounded-full transition-all ${i === activeTestimonial ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RIGHT FORM PANEL ─────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <Leaf size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-black text-gray-800">AyurLife</span>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5 border border-emerald-100">
                            <ShieldCheck size={12} />
                            Secure Sign In
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                            Welcome<br />back 👋
                        </h2>
                        <p className="text-gray-400 font-medium mt-2 text-sm">
                            Sign in to continue to your AyurLife account
                        </p>
                    </div>

                    {/* Decorative trust badges */}
                    <div className="flex items-center gap-3 mb-8">
                        {[
                            { img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&q=80', label: '200+ Doctors' },
                            { img: 'https://images.unsplash.com/photo-1583912268183-a34d41fe464a?w=60&q=80', label: '10K+ Patients' },
                            { img: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=60&q=80', label: 'Premium Herbs' },
                        ].map(({ img, label }) => (
                            <div key={label} className="flex-1 flex flex-col items-center gap-1.5 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                                <img src={img} alt={label} className="w-10 h-10 rounded-xl object-cover" />
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center leading-tight">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={submitHandler} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                list="email-suggestions"
                                required
                                className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 focus:bg-white transition-all placeholder:text-gray-300 text-sm font-medium"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <datalist id="email-suggestions">
                                {usedEmails.map((savedEmail, i) => <option key={i} value={savedEmail} />)}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    autoComplete="current-password"
                                    className="block w-full px-5 pr-12 py-4 bg-gray-50 border border-gray-100 text-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 focus:bg-white transition-all placeholder:text-gray-300 text-sm font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-4 flex items-center text-gray-300 hover:text-emerald-500 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
                                <span>⚠</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-black rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:scale-100"
                        >
                            {loading
                                ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                : <><span>Sign In to AyurLife</span><ArrowRight size={16} /></>
                            }
                        </button>

                        <p className="text-sm text-center text-gray-400 font-medium pt-2">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-emerald-600 font-black hover:text-emerald-500 transition-colors">
                                Create one free →
                            </Link>
                        </p>
                    </form>

                    {/* Bottom footer note */}
                    <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        <ShieldCheck size={12} className="text-emerald-400" />
                        <span>256-bit SSL · HIPAA Compliant · Trusted by 10,000+</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
