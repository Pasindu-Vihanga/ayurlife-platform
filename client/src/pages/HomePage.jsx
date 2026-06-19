import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Leaf, Activity, ShieldCheck, HeartPulse, ChevronRight, UserCircle2, Star, Moon, Sun } from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
const HomePage = () => {
    const { theme, toggleTheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [usedEmails, setUsedEmails] = useState([]);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Load used emails for auto-suggestion
        const history = JSON.parse(localStorage.getItem('usedEmails') || '[]');
        setUsedEmails(history);

        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            if (user.role === 'producer') {
                navigate('/production');
            } else {
                navigate('/dashboard');
            }
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users/login', { email, password });

            // Save email for future auto-suggestions
            const history = JSON.parse(localStorage.getItem('usedEmails') || '[]');
            if (!history.includes(email)) {
                history.push(email);
                localStorage.setItem('usedEmails', JSON.stringify(history));
            }

            localStorage.setItem('userInfo', JSON.stringify(data));
            if (data.role === 'producer') {
                navigate('/production');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            err.response?.data?.message;
        }
    };

    return (
        <div className="min-h-screen bg-surface dark:bg-darkSurface selection:bg-primary/20 transition-colors duration-500">
            {/* Custom Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/80 dark:bg-darkSurface/80 backdrop-blur-md py-4 border-b border-gray-100 dark:border-gray-800' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="bg-primary dark:bg-green-600 p-1.5 rounded-lg shadow-lg shadow-primary/20">
                            <Leaf className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tighter uppercase">AyurLife</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-green-500 transition-colors">Features</a>
                        <a href="#about" className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-green-500 transition-colors">About Wellness</a>
                        <ThemeToggle />
                        <button onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-2 bg-primary dark:bg-green-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 dark:shadow-green-900/20">Get Started</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none -z-10" />
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                            <Star size={12} className="text-accent fill-accent" />
                            <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Ayurveda Reimagined</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-gray-100 tracking-tighter leading-[0.95]">
                            Experience <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary dark:from-green-400 dark:to-emerald-500">Healing</span> <br />
                            Harmony.
                        </h1>
                        <p className="max-w-md text-lg text-gray-500 font-medium leading-relaxed italic">
                            "Where ancient Ayurvedic wisdom meets cutting-edge modern technology for your ultimate well-being."
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <div className="flex items-center space-x-4 p-4 bg-white dark:bg-darkSurface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 transition-colors">
                                <div className="h-10 w-10 bg-primary/10 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-primary dark:text-green-500">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Total Care</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Verified Doctors</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 p-4 bg-white dark:bg-darkSurface rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex-1 transition-colors">
                                <div className="h-10 w-10 bg-accent/10 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-accent dark:text-amber-500">
                                    <HeartPulse size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-muted dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Wellness</p>
                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Active Therapies</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Login Form */}
                    <div id="login-section" className="relative group animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-100 transition duration-1000" />
                        <div className="relative bg-white/80 dark:bg-darkSurface backdrop-blur-2xl p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-gray-800 space-y-8 transition-colors">
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">Welcome Back</h2>
                                <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted dark:text-gray-500">A healthier you starts here</p>
                            </div>

                            <form className="space-y-6" onSubmit={submitHandler}>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            list="email-suggestions"
                                            required
                                            className="block w-full px-5 py-4 bg-gray-50 dark:bg-darkSurface border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-green-900/10 focus:border-primary/20 dark:focus:border-green-500/20 transition-all duration-300"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                        <datalist id="email-suggestions">
                                            {usedEmails.map((savedEmail, index) => (
                                                <option key={index} value={savedEmail} />
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                required
                                                onInvalid={e =>
                                                    e.target.setCustomValidity('')
                                                }
                                                autoComplete="current-password"
                                                className="block w-full px-5 pr-14 py-4 bg-gray-50 dark:bg-darkSurface border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm font-bold rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 dark:focus:ring-green-900/10 focus:border-primary/20 dark:focus:border-green-500/20 transition-all duration-300"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-4 flex items-center text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-green-500 transition-colors focus:outline-none"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 animate-in fade-in zoom-in-95">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="relative w-full overflow-hidden group/btn py-4 bg-primary dark:bg-green-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_40px_-15px_rgba(45,90,39,0.3)] dark:shadow-green-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Enter AyurLife <ChevronRight size={14} />
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary dark:from-emerald-500 dark:to-green-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                                </button>

                                <div className="text-[10px] text-center font-black uppercase tracking-widest pt-2">
                                    <span className="text-gray-400">New around here? </span>
                                    <Link to="/register" className="text-primary hover:text-secondary underline decoration-2 underline-offset-4 transition-colors">
                                        Create an account
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-32 bg-white dark:bg-darkSurface relative transition-colors">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-20">
                        <h2 className="text-[10px] font-black text-primary dark:text-green-500 uppercase tracking-[0.3em]">Core Services</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none">Everything for your journey.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<UserCircle2 size={24} />}
                            title="Expert Consultations"
                            desc="Connect with certified Ayurvedic doctors for personalized treatment plans."
                            color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        />
                        <FeatureCard
                            icon={<Activity size={24} />}
                            title="Healing Therapies"
                            desc="Discover and book rejuvenation treatments specialized for your wellness needs."
                            color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                        />
                        <FeatureCard
                            icon={<Leaf size={24} />}
                            title="Pure Medicine"
                            desc="Direct access to verified herbal inventories and small-batch production."
                            color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 dark:border-gray-800 px-6 transition-colors">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-2 grayscale opacity-50 dark:invert">
                        <Leaf size={16} />
                        <span className="text-sm font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase">AyurLife</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">© 2026 AyurLife Wellness Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, color }) => (
    <div className="group p-10 bg-gray-50/50 dark:bg-darkSurface/30 rounded-[2.5rem] border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-white dark:hover:bg-darkSurface hover:shadow-xl transition-all duration-500">
        <div className={`h-14 w-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
            {icon}
        </div>
        <h4 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-3 tracking-tight">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
    </div>
);

export default HomePage;
