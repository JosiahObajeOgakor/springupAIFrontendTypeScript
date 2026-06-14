'use client'

import { useEffect, useState } from 'react'

export default function NotFound() {
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (countdown === 0) {
      window.location.replace('/')
    }
  }, [countdown])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 overflow-hidden relative">
      {/* Animated background orbs */}
      <div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-10 animate-[drift_8s_ease-in-out_infinite]"
        style={{ background: 'oklch(0.35 0.15 142)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-80 h-80 rounded-full opacity-10 animate-[drift_10s_ease-in-out_infinite_reverse]"
        style={{ background: 'oklch(0.35 0.15 142)' }}
      />
      <div
        className="absolute top-1/2 left-[-5%] w-48 h-48 rounded-full opacity-5 animate-[drift_6s_ease-in-out_infinite_1s]"
        style={{ background: 'oklch(0.35 0.15 142)' }}
      />

      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full animate-[float_3s_ease-in-out_infinite]"
          style={{
            width: `${4 + (i % 4) * 3}px`,
            height: `${4 + (i % 4) * 3}px`,
            background: 'oklch(0.35 0.15 142)',
            opacity: 0.15 + (i % 5) * 0.08,
            left: `${5 + i * 8}%`,
            top: `${10 + ((i * 37) % 80)}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${3 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Main card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

        {/* Animated 404 */}
        <div className="relative mb-6 select-none">
          <span
            className="text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter animate-[pulse-glow_2s_ease-in-out_infinite]"
            style={{ color: 'oklch(0.35 0.15 142)' }}
          >
            404
          </span>
          {/* Shadow / echo layers */}
          <span
            className="absolute inset-0 text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter opacity-10 translate-x-1 translate-y-1 select-none pointer-events-none"
            style={{ color: 'oklch(0.35 0.15 142)' }}
            aria-hidden
          >
            404
          </span>
        </div>

        {/* Divider with animation */}
        <div className="flex items-center gap-3 mb-6 w-full max-w-xs">
          <div
            className="flex-1 h-px animate-[expand_0.8s_ease-out_forwards]"
            style={{ background: 'oklch(0.35 0.15 142)', opacity: 0.3 }}
          />
          <svg
            className="w-5 h-5 animate-[spin_4s_linear_infinite]"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: 'oklch(0.35 0.15 142)' }}
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
              fill="currentColor"
              opacity="0"
            />
            <path
              d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 4l2 4h-4l2-4zm0 14l-2-4h4l-2 4z"
              fill="currentColor"
            />
          </svg>
          <div
            className="flex-1 h-px animate-[expand_0.8s_ease-out_forwards]"
            style={{ background: 'oklch(0.35 0.15 142)', opacity: 0.3 }}
          />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 animate-[fade-up_0.6s_ease-out_0.2s_both]">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-base mb-8 leading-relaxed animate-[fade-up_0.6s_ease-out_0.3s_both]">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Don&apos;t worry — we&apos;ll get you back on track.
        </p>

        {/* Countdown ring */}
        <div className="relative mb-8 animate-[fade-up_0.6s_ease-out_0.4s_both]">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              strokeWidth="5"
              stroke="oklch(0.35 0.15 142)"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 10)}`}
              style={{ transition: 'stroke-dashoffset 0.9s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color: 'oklch(0.35 0.15 142)' }}>
              {countdown}
            </span>
            <span className="text-[10px] text-gray-400 leading-none">sec</span>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6 animate-[fade-up_0.6s_ease-out_0.5s_both]">
          Redirecting to home in{' '}
          <span className="font-semibold" style={{ color: 'oklch(0.35 0.15 142)' }}>
            {countdown}s
          </span>
        </p>

        {/* CTA button */}
        <button
          onClick={() => window.location.replace('/')}
          className="group relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white text-sm shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 animate-[fade-up_0.6s_ease-out_0.6s_both]"
          style={{ background: 'oklch(0.35 0.15 142)' }}
        >
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Home Now
          {/* Shimmer */}
          <span className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <span className="absolute top-0 left-[-75%] w-1/2 h-full bg-white opacity-20 skew-x-[-20deg] group-hover:left-[150%] transition-all duration-700" />
          </span>
        </button>
      </div>

      {/* Brand footer */}
      <div className="absolute bottom-6 text-xs text-gray-300 animate-[fade-up_0.6s_ease-out_0.8s_both]">
        SpringUpAI © {new Date().getFullYear()}
      </div>

      <style>{`
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-15px, 20px) scale(0.95); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
        }
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 0px oklch(0.35 0.15 142 / 0)); }
          50% { filter: drop-shadow(0 0 24px oklch(0.35 0.15 142 / 0.35)); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  )
}
