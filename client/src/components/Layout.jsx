import Sidebar from './Sidebar';
import { Search, Bell, Settings } from 'lucide-react';

const Layout = ({ children }) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    return (
        <div className="flex bg-gray-50 dark:bg-darkSurface min-h-screen transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* ── Top Header ── */}
                <header className="h-[70px] bg-white dark:bg-darkSurface border-b border-gray-100 dark:border-gray-900 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors duration-300 shadow-sm">

                    {/* Search */}
                    <div className="flex-1 max-w-md">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 rounded-2xl py-2.5 pl-11 pr-4 text-sm dark:text-gray-200 focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 outline-none"
                            />
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3 ml-4">
                        {/* Notification Bell */}
                        <button className="relative h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-100 transition-all">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
                        </button>

                        {/* Divider */}
                        <div className="h-6 w-px bg-gray-100 dark:bg-gray-800"></div>

                        {/* User Avatar */}
                        <div className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-gray-700 dark:text-gray-200 leading-tight group-hover:text-emerald-600 transition-colors">{userInfo?.name?.split(' ')[0]}</p>
                                <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{userInfo?.role}</p>
                            </div>
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30 group-hover:scale-105 transition-transform">
                                <span className="text-sm font-black">{userInfo?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Content Area ── */}
                <main className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-darkSurface">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
