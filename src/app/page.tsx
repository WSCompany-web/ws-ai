'use client'

import { useState, useSyncExternalStore } from 'react'

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export default function Home() {
  const mounted = useMounted()
  const [inputValue, setInputValue] = useState('')
  const [hoveredAction, setHoveredAction] = useState<number | null>(null)

  const actions = [
    { icon: '✦', label: 'Créer une image' },
    { icon: '✎', label: 'Écrire ou modifier' },
    { icon: '⌕', label: 'Faire une recherche' },
  ]

  const recentChats = [
    'Traduction Français-Anglais',
    'Trouver l\'endroit exact',
    'Demande portrait iris HD',
    'Analyse de données Q4',
    'Génération de code React',
  ]

  const navItems = [
    { icon: '⊞', label: 'Bibliothèque' },
    { icon: '⊡', label: 'Projets' },
    { icon: '⊞', label: 'Applications' },
    { icon: '⟩', label: 'Codex' },
    { icon: '+', label: 'Plus' },
  ]

  return (
    <div className="min-h-screen flex bg-[#0d0d0d] text-white font-[var(--font-geist-sans)]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] min-h-screen bg-[#171717] border-r border-white/[0.06]">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/90 to-white/50 flex items-center justify-center">
            <span className="text-black font-bold text-sm">WS</span>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">WS</span>
        </div>

        {/* Search */}
        <div className="px-3 mb-2">
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-lg px-3 py-2.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="text-white/30 text-sm">Rechercher dans les chats</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-2 mb-4">
          {navItems.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/[0.06] hover:text-white transition-colors text-sm"
            >
              <span className="text-white/50 text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Recent Chats */}
        <div className="px-3 flex-1">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2 px-1">Récents</p>
          <div className="space-y-0.5">
            {recentChats.map((chat, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2 rounded-lg text-white/60 hover:bg-white/[0.06] hover:text-white/90 transition-colors text-sm truncate"
              >
                {chat}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs">
              Y
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/90 text-sm font-medium truncate">Yanis</p>
              <p className="text-white/30 text-xs">Free</p>
            </div>
          </div>
          <button className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#333] rounded-lg px-3 py-2.5 text-white/70 hover:text-white transition-colors text-sm">
            <span className="text-amber-400">★</span>
            Mettre à niveau
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/90 to-white/50 flex items-center justify-center">
              <span className="text-black font-bold text-xs">WS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#333] rounded-full px-3 py-1.5 text-white/70 hover:text-white transition-colors text-sm">
              <span className="text-amber-400 text-xs">★</span>
              Mettre à niveau
            </button>
            <button className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#333] flex items-center justify-center transition-colors md:hidden">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </header>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
          {/* WS Logo - Large */}
          <div
            className={`transition-all duration-700 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
          >
            <div className="relative mb-8">
              {/* Glow effect behind the logo */}
              <div className="absolute inset-0 blur-3xl bg-white/[0.03] rounded-full scale-150" />
              <h1 className="relative text-8xl md:text-9xl font-bold tracking-tighter text-white/90">
                WS
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <p
            className={`text-white/50 text-lg md:text-xl mb-10 transition-all duration-700 delay-200 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            Toujours prêt à répondre.
          </p>

          {/* Search Bar */}
          <div
            className={`w-full max-w-2xl transition-all duration-700 delay-300 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="relative flex items-center bg-[#2a2a2a] rounded-full px-5 py-4 border border-white/[0.06] hover:border-white/[0.12] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30 mr-3 flex-shrink-0">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Poser une question"
                className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
              />
              <div className="flex items-center gap-2 ml-3">
                <button className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </button>
                <button className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className={`flex flex-wrap items-center justify-center gap-2 mt-6 transition-all duration-700 delay-500 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {actions.map((action, i) => (
              <button
                key={i}
                onMouseEnter={() => setHoveredAction(i)}
                onMouseLeave={() => setHoveredAction(null)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 ${
                  hoveredAction === i
                    ? 'bg-white/[0.08] border-white/[0.12] text-white'
                    : 'bg-transparent border-white/[0.06] text-white/60 hover:text-white/80'
                }`}
              >
                <span className="text-sm">{action.icon}</span>
                <span className="text-sm">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto px-4 py-4 text-center">
          <p className="text-white/20 text-xs">
            WS peut faire des erreurs. Envisagez de vérifier les informations importantes.
          </p>
        </footer>
      </main>
    </div>
  )
}
