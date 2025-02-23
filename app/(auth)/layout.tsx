'use client'

import React from 'react'

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({children}) => {
    return (
        <div className="min-h-screen flex items-center justify-center py-16" style={{ background: '#065f46' }}>
            {/* Animated gradient background */}
            <div className="fixed inset-0 bg-[linear-gradient(120deg,#84fab0_0%,#8fd3f4_100%)] opacity-30" />
            
            {/* Geometric pattern overlay */}
            <div 
                className="fixed inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(30deg, #065f46 12%, transparent 12.5%, transparent 87%, #065f46 87.5%, #065f46),
                        linear-gradient(150deg, #065f46 12%, transparent 12.5%, transparent 87%, #065f46 87.5%, #065f46),
                        linear-gradient(30deg, #065f46 12%, transparent 12.5%, transparent 87%, #065f46 87.5%, #065f46),
                        linear-gradient(150deg, #065f46 12%, transparent 12.5%, transparent 87%, #065f46 87.5%, #065f46),
                        linear-gradient(60deg, #0657464d 25%, transparent 25.5%, transparent 75%, #0657464d 75%, #0657464d)
                    `,
                    backgroundSize: '80px 140px',
                    backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0'
                }}
            />

            {/* Radial gradient overlay */}
            <div 
                className="fixed inset-0"
                style={{
                    background: 'radial-gradient(circle at center, transparent 0%, rgba(0,50,0,0.2) 100%)'
                }}
            />

            {/* Floating particles effect */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-emerald-500/20"
                        style={{
                            width: Math.random() * 100 + 50 + 'px',
                            height: Math.random() * 100 + 50 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                            animationDelay: `-${Math.random() * 10}s`
                        }}
                    />
                ))}
            </div>

                {children}

            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-100px) rotate(180deg); }
                    100% { transform: translateY(0) rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

export default Layout