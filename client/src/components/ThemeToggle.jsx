import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex h-10 w-20 items-center rounded-full bg-gray-200/50 p-1 transition-colors duration-500 hover:bg-gray-300/50 dark:bg-darkSurface/50 dark:hover:bg-darkSurface/80 backdrop-blur-md border border-gray-100 dark:border-gray-900 shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Toggle Theme"
        >
            {/* Background Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-gray-400">
                <Sun size={14} className={theme === 'light' ? 'text-primary' : ''} />
                <Moon size={14} className={theme === 'dark' ? 'text-accent' : ''} />
            </div>

            {/* Moving Circle */}
            <motion.div
                className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-darkSurface shadow-lg border border-gray-100 dark:border-gray-900"
                animate={{
                    x: theme === 'light' ? 0 : 40,
                }}
                transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 30
                }}
            >
                {theme === 'light' ? (
                    <Sun size={16} className="text-primary animate-in spin-in-180 duration-500" />
                ) : (
                    <Moon size={16} className="text-accent animate-in spin-in-180 duration-500" />
                )}
            </motion.div>
        </button>
    );
};

export default ThemeToggle;
