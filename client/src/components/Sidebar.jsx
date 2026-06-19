import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    ClipboardList,
    LogOut,
    ShoppingBag,
    Settings,
    Activity,
    Calendar,
    Stethoscope,
    UserCircle,
    Leaf,
    ChevronRight,
    BookOpen
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';

const Sidebar = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const menuItems = {
        patient: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: Calendar, label: 'Appointments', path: '/book-appointment' },
            { icon: ClipboardList, label: 'Symptoms', path: '/symptoms' },
            { icon: UserCircle, label: 'Wellness', path: '/book-therapy' },
            { icon: ShoppingBag, label: 'Herb Shop', path: '/herb-shop' },
        ],
        doctor: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
            { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
            { icon: Stethoscope, label: 'Patients', path: '/doctor/patients' },
            { icon: BookOpen, label: 'Knowledge Base', path: '/knowledge' },
            { icon: ShoppingBag, label: 'Herb Shop', path: '/herb-shop' },
            { icon: Settings, label: 'Availability', path: '/doctor/availability' },
        ],
        admin: [
            { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
            { icon: Users, label: 'Manage Users', path: '/dashboard' },
            { icon: Settings, label: 'Site Settings', path: '/admin/settings' },
        ],
        supplier: [
            { icon: LayoutDashboard, label: 'Inventory', path: '/dashboard' },
            { icon: Leaf, label: 'New Herbs', path: '/dashboard?tab=requests' },
        ],
        producer: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/production' },
            { icon: Package, label: 'Manage Batches', path: '/production/manage' },
            { icon: Leaf, label: 'Inventory', path: '/inventory-manage' },
            { icon: ShoppingBag, label: 'Herb Shop', path: '/herb-shop' },
        ],
        wellness_staff: [
            { icon: LayoutDashboard, label: 'Wellness Ops', path: '/dashboard' },
            { icon: Leaf, label: 'Services', path: '/wellness/services' },
        ]
    };

    const roleColors = {
        patient: 'text-emerald-600 bg-emerald-50',
        doctor: 'text-blue-600 bg-blue-50',
        admin: 'text-violet-600 bg-violet-50',
        supplier: 'text-amber-600 bg-amber-50',
        producer: 'text-orange-600 bg-orange-50',
        wellness_staff: 'text-teal-600 bg-teal-50',
    };

    const currentMenu = menuItems[userInfo?.role] || [];
    const roleColor = roleColors[userInfo?.role] || 'text-gray-600 bg-gray-50';

    return (
        <div className="w-72 bg-white dark:bg-darkSurface h-screen flex flex-col border-r border-gray-100 dark:border-gray-900 transition-all duration-300 shadow-sm">

            {/* ── Logo ── */}
            <div className="px-6 py-7 flex items-center gap-3 border-b border-gray-100 dark:border-gray-900">
                <div className="h-11 w-11 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 flex-shrink-0">
                    <span className="text-xl">🌿</span>
                </div>
                <div>
                    <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">AyurLife</h1>
                    <span className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest">Wellness Platform</span>
                </div>
            </div>

            {/* ── Navigation ── */}
            <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                <span className="block text-[9px] uppercase font-black text-gray-400 dark:text-gray-600 tracking-widest px-3 mb-3">
                    Main Menu
                </span>

                {currentMenu.map((item, idx) => {
                    const fullCurrentPath = location.pathname + location.search;
                    const isActive = item.path.includes('?')
                        ? fullCurrentPath === item.path
                        : location.pathname === item.path && location.search === '';

                    return (
                        <Link
                            key={idx}
                            to={item.path}
                            className={`group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200
                                ${isActive
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200 dark:shadow-emerald-900/30'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all
                                    ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                                    }`}>
                                    <item.icon size={17} />
                                </div>
                                <span className={`font-bold text-sm ${isActive ? 'text-white' : ''}`}>
                                    {item.label}
                                </span>
                            </div>
                            {isActive && (
                                <ChevronRight size={15} className="text-white/60" />
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* ── User Card + Sign Out ── */}
            <div className="p-4 space-y-3 border-t border-gray-100 dark:border-gray-900">
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30">
                        <UserCircle size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 truncate leading-tight">{userInfo?.name}</h3>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${roleColor} dark:bg-opacity-20`}>
                            {userInfo?.role}
                        </span>
                    </div>
                </div>

                {/* Theme Toggle */}
                <div className="flex justify-center">
                    <ThemeToggle />
                </div>

                {/* Sign Out Button */}
                <button
                    type="button"
                    onClick={logoutHandler}
                    className="w-full group flex items-center justify-center gap-2.5 py-3 rounded-2xl
                        bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400
                        border border-red-100 dark:border-red-900/30
                        hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white
                        hover:border-transparent hover:shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/30
                        font-black text-[11px] uppercase tracking-widest
                        transition-all duration-300"
                >
                    <LogOut size={15} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
