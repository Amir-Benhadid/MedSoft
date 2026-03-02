
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AppLoaderProps {
    logoPath?: string;
    businessName?: string;
    onComplete: () => void;
}

const LOADING_STATES = [
    "Initialising systems...",
    "Loading secure modules...",
    "Verifying credentials...",
    "Connecting to database...",
    "Preparing workspace...",
];

export function AppLoader({ logoPath, businessName, onComplete }: AppLoaderProps) {
    const [statusIndex, setStatusIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    // Progress and State simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + 0.5;
                return next > 100 ? 0 : next; // Loop for design preview
            });
        }, 20);

        const statusInterval = setInterval(() => {
            setStatusIndex(prev => (prev + 1) % LOADING_STATES.length);
        }, 2000);

        return () => {
            clearInterval(interval);
            clearInterval(statusInterval);
        };
    }, []);

    useEffect(() => {
        if (progress >= 100) {
            onComplete();
        }
    }, [progress, onComplete]);

    return (
        <div
            className="h-screen w-screen bg-transparent flex flex-col items-center justify-center overflow-hidden select-none font-sans"
            style={{ WebkitAppRegion: 'drag' } as any}
        >
            <div className="relative flex flex-col items-center justify-center">

                {/* Visual Anchor / Glow */}
                <motion.div
                    className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full"
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Main Content Container */}
                <div className="z-10 flex flex-col items-center gap-6">

                    {/* Logo Section */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: "spring" }}
                        className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/20"
                    >
                        {logoPath ? (
                            <img
                                src={`local-resource:///${logoPath.replace(/\\/g, '/')}`}
                                alt="App Logo"
                                className="w-full h-full object-contain p-6 drop-shadow-md"
                            />
                        ) : (
                            <div className="text-6xl font-bold text-white tracking-tighter">
                                CM
                            </div>
                        )}

                        {/* Shimmer Effect on Card */}
                        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                            <motion.div
                                className="w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"
                                animate={{ x: ['-200%', '200%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear", delay: 1 }}
                            />
                        </div>
                    </motion.div>

                    {/* Text Section */}
                    <div className="flex flex-col items-center text-center space-y-2">
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-3xl font-bold text-white tracking-wide shadow-black drop-shadow-lg"
                        >
                            {businessName || 'Cabinet Médical'}
                        </motion.h1>

                        <div className="h-6 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={statusIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="text-sm font-medium text-white/70 tracking-wider uppercase"
                                >
                                    {LOADING_STATES[statusIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "160px" }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="h-1 bg-white/10 rounded-full overflow-hidden mt-2"
                    >
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-blue-400"
                            style={{ width: `${progress}%` }}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
