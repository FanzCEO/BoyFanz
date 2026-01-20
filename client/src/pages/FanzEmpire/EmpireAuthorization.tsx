/**
 * Empire Authorization - Entry Gate
 * 
 * For now, just requires the user to confirm entry.
 * Future: WebAuthn step-up authentication.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EMPIRE_AUTH } from "@/constants/fanzEmpireCopy";
import { useAuth } from "@/hooks/useAuth";

interface EmpireAuthorizationProps {
  onSuccess: () => void;
  onBack?: () => void;
  userName?: string;
}

type AuthState = "initial" | "verifying" | "success";

export default function EmpireAuthorization({ onSuccess, onBack, userName }: EmpireAuthorizationProps) {
  const { user } = useAuth();
  const [state, setState] = useState<AuthState>("initial");

  const displayName = userName || (user as any)?.displayName || (user as any)?.email?.split("@")[0] || "Operator";

  const handleEnter = async () => {
    setState("verifying");
    
    // Simulate verification animation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setState("success");
    setTimeout(onSuccess, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Back/Exit Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 text-cyan-400/60 hover:text-cyan-400 font-mono text-sm tracking-wider transition-colors border border-cyan-500/20 hover:border-cyan-500/40 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          EXIT
        </button>
      )}

      {/* Background ambient effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-radial from-cyan-900/20 via-transparent to-transparent"
        />
      </div>

      <AnimatePresence mode="wait">
        {state === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-cyan-400/60 text-sm tracking-[0.3em] mb-2"
            >
              — IDENTITY VERIFIED —
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-cyan-200 text-3xl font-bold tracking-[0.2em] mb-4"
            >
              ACCESS GRANTED
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 text-lg tracking-wider"
            >
              Welcome, {displayName}
            </motion.div>
          </motion.div>
        ) : state === "verifying" ? (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-mono"
          >
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 mx-auto mb-6 rounded-full border-2 border-cyan-500/50 flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600" />
            </motion.div>
            <div className="text-cyan-200/80 text-lg tracking-[0.2em]">
              VERIFYING CREDENTIALS
            </div>
            <div className="text-cyan-400/40 text-xs tracking-wider mt-2">
              PLEASE STAND BY
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="initial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md w-full mx-4"
          >
            <div className="border border-cyan-500/30 bg-black/90 backdrop-blur rounded-lg p-8 text-center">
              {/* Logo/Icon */}
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-cyan-500/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-cyan-400/40"
                />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-cyan-300 text-2xl">E</span>
                </div>
              </div>

              <h2 className="text-cyan-200 text-2xl font-bold tracking-wider mb-4 font-mono">
                FANZ EMPIRE
              </h2>
              <p className="text-white/80 text-lg mb-2">
                {EMPIRE_AUTH?.primaryLine || "You are entering secured operational space."}
              </p>
              <p className="text-gray-500 text-sm mb-8">
                {EMPIRE_AUTH?.secondaryLine || "Authorization required to proceed."}
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleEnter}
                  className="w-full px-6 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-bold rounded font-mono tracking-wider transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    AUTHORIZE ENTRY
                  </span>
                </button>
              </div>

              <p className="text-gray-600 text-xs mt-6 font-mono">
                {EMPIRE_AUTH?.footer || "Biometric data is never stored. Session expires in 15 minutes."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
