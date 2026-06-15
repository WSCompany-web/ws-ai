'use client'

import { useState, useSyncExternalStore, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ImageIcon,
  PenLine,
  Search,
  Send,
  X,
  Mic,
  Volume2,
  Sparkles,
  ArrowRight,
  Loader2,
  Library,
  FolderKanban,
  AppWindowMac,
  Code2,
  Plus,
  Settings,
  Star,
  ChevronRight,
} from 'lucide-react'

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

type ActivePanel = null | 'image' | 'write' | 'search'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface SearchResult {
  title: string
  url: string
  snippet: string
}

export default function Home() {
  const mounted = useMounted()
  const [inputValue, setInputValue] = useState('')
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState('')

  // Chat / writing state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return
    setImageLoading(true)
    setImageError('')
    setGeneratedImage(null)
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt }),
      })
      const data = await res.json()
      if (data.error) {
        setImageError(data.error)
      } else {
        setGeneratedImage(data.image)
      }
    } catch {
      setImageError('Erreur réseau')
    } finally {
      setImageLoading(false)
    }
  }

  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg: ChatMessage = { role: 'user', content: chatInput }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)
    scrollToBottom()
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.error) {
        setChatMessages([...newMessages, { role: 'assistant', content: `Erreur : ${data.error}` }])
      } else {
        setChatMessages([...newMessages, { role: 'assistant', content: data.content }])
      }
    } catch {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Erreur réseau' }])
    } finally {
      setChatLoading(false)
      scrollToBottom()
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setSearchError('')
    setSearchResults([])
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      })
      const data = await res.json()
      if (data.error) {
        setSearchError(data.error)
      } else {
        const results = data.results?.results || data.results || []
        setSearchResults(
          Array.isArray(results)
            ? results.slice(0, 8).map((r: Record<string, string>) => ({
                title: r.title || r.name || '',
                url: r.url || r.link || '',
                snippet: r.snippet || r.content || r.description || '',
              }))
            : []
        )
      }
    } catch {
      setSearchError('Erreur réseau')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleMainInput = () => {
    if (inputValue.trim()) {
      setActivePanel('write')
      setChatMessages([{ role: 'user', content: inputValue }])
      setChatInput('')
      setInputValue('')
      setChatLoading(true)
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: inputValue }] }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.content) {
            setChatMessages([
              { role: 'user', content: inputValue },
              { role: 'assistant', content: data.content },
            ])
          }
        })
        .catch(() => {})
        .finally(() => {
          setChatLoading(false)
          scrollToBottom()
        })
    }
  }

  const actions = [
    { icon: ImageIcon, label: 'Créer une image', panel: 'image' as const, color: 'from-violet-500/20 to-fuchsia-500/20', hoverBorder: 'hover:border-violet-500/40', iconColor: 'text-violet-400' },
    { icon: PenLine, label: 'Écrire ou modifier', panel: 'write' as const, color: 'from-emerald-500/20 to-teal-500/20', hoverBorder: 'hover:border-emerald-500/40', iconColor: 'text-emerald-400' },
    { icon: Search, label: 'Faire une recherche', panel: 'search' as const, color: 'from-amber-500/20 to-orange-500/20', hoverBorder: 'hover:border-amber-500/40', iconColor: 'text-amber-400' },
  ]

  const recentChats = [
    'Traduction Français-Anglais',
    "Trouver l'endroit exact",
    'Demande portrait iris HD',
    'Analyse de données Q4',
    'Génération de code React',
  ]

  const navItems = [
    { icon: Library, label: 'Bibliothèque' },
    { icon: FolderKanban, label: 'Projets' },
    { icon: AppWindowMac, label: 'Applications' },
    { icon: Code2, label: 'Codex' },
    { icon: Plus, label: 'Plus' },
  ]

  return (
    <div className="min-h-screen flex bg-[#050510] text-white font-[var(--font-geist-sans)] overflow-hidden">
      {/* ===== FRANCE-THEMED BACKGROUND ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* AI-generated Paris background — cinematic Ken Burns slow zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-75 animate-[kenburns_60s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: 'url(/france-bg.png)' }}
        />

        {/* Very subtle tricolor tint — barely there, just a whisper */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 h-full bg-[#002395]/8" />
          <div className="w-1/3 h-full bg-white/[0.01]" />
          <div className="w-1/3 h-full bg-[#ED2939]/7" />
        </div>

        {/* Faint tricolor diagonal glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#002395]/5 via-transparent to-[#ED2939]/5" />

        {/* Floating bleu orb — very subtle */}
        <div className="absolute -top-[10%] -left-[5%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-[#002395]/8 via-[#003399]/4 to-transparent animate-[float1_25s_ease-in-out_infinite] blur-3xl" />
        {/* Floating rouge orb — very subtle */}
        <div className="absolute -bottom-[10%] -right-[5%] w-[800px] h-[800px] rounded-full bg-gradient-to-tl from-[#ED2939]/7 via-[#C8102E]/3 to-transparent animate-[float2_30s_ease-in-out_infinite] blur-3xl" />
        {/* Floating blanc orb — barely visible */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-white/[0.03] via-white/[0.01] to-transparent animate-[float3_20s_ease-in-out_infinite] blur-3xl" />

        {/* Bleu accent spot — faint */}
        <div className="absolute top-[15%] right-[15%] w-[300px] h-[300px] rounded-full bg-[#002395]/5 animate-[float4_18s_ease-in-out_infinite] blur-2xl" />
        {/* Rouge accent spot — faint */}
        <div className="absolute bottom-[10%] left-[15%] w-[350px] h-[350px] rounded-full bg-[#ED2939]/4 animate-[float5_22s_ease-in-out_infinite] blur-2xl" />
        {/* White accent spot — faint */}
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-white/[0.015] animate-[float3_22s_ease-in-out_infinite] blur-2xl" />

        {/* Hair-thin tricolor lines at edges — ultra subtle */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#002395] via-white to-[#ED2939] opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-[#002395] via-white to-[#ED2939] opacity-20" />

        {/* Light vignette — keeps depth without killing the image */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.45)_100%)]" />
      </div>

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed md:relative z-40 flex flex-col w-[260px] h-screen bg-[#0d0d1a]/90 backdrop-blur-xl border-r border-[#002395]/[0.08] transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#002395] via-white/90 to-[#ED2939] flex items-center justify-center shadow-lg shadow-[#002395]/20">
            <span className="text-black font-bold text-sm tracking-tight">WS</span>
          </div>
          <span className="text-white font-semibold text-base tracking-tight">WS</span>
          <button
            className="ml-auto md:hidden text-white/50 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 mb-3">
          <div className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.06] rounded-xl px-3 py-2.5 border border-white/[0.04] transition-colors cursor-text">
            <Search size={14} className="text-white/30" />
            <span className="text-white/25 text-sm">Rechercher</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-2 mb-4">
          {navItems.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:bg-white/[0.05] hover:text-white/90 transition-all text-sm group"
            >
              <item.icon size={16} className="text-white/35 group-hover:text-white/60 transition-colors" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Recent Chats */}
        <div className="px-3 flex-1 overflow-y-auto">
          <p className="text-white/30 text-xs font-medium uppercase tracking-widest mb-2 px-1">Récents</p>
          <div className="space-y-0.5">
            {recentChats.map((chat, i) => (
              <button
                key={i}
                className="w-full text-left px-3 py-2 rounded-xl text-white/45 hover:bg-white/[0.05] hover:text-white/80 transition-all text-sm truncate flex items-center gap-2 group"
              >
                <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
                <span className="truncate">{chat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#002395] to-[#ED2939] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#002395]/20">
              Y
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-sm font-medium truncate">Yanis</p>
              <p className="text-white/25 text-xs">Free</p>
            </div>
          </div>
          <button className="w-full mt-2 flex items-center justify-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] rounded-xl px-3 py-2.5 text-white/60 hover:text-white transition-all text-sm border border-white/[0.04]">
            <Star size={14} className="text-amber-400" />
            Mettre à niveau
          </button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex flex-col min-h-screen relative">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 md:px-6 relative z-10">
          <button
            className="md:hidden text-white/50 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#002395] via-white/90 to-[#ED2939] flex items-center justify-center">
              <span className="text-black font-bold text-[10px]">WS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-full px-3 py-1.5 text-white/60 hover:text-white transition-all text-sm border border-white/[0.04]">
              <Star size={12} className="text-amber-400" />
              Mettre à niveau
            </button>
            <button className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all">
              <Settings size={16} className="text-white/40" />
            </button>
          </div>
        </header>

        {/* Center / Home View */}
        <AnimatePresence mode="wait">
          {activePanel === null ? (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center px-4 -mt-16 relative z-10"
            >
              {/* WS Logo - Large with glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-6"
              >
                {/* Animated glow ring — French tricolor */}
                <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-br from-[#002395]/15 via-white/5 to-[#ED2939]/15 blur-2xl animate-pulse" />
                <h1 className="relative text-8xl md:text-[10rem] font-bold tracking-tighter bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                  WS
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-white/40 text-lg md:text-xl mb-10 flex items-center gap-2"
              >
                <Sparkles size={16} className="text-amber-400/60" />
                Toujours prêt à répondre.
              </motion.p>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="w-full max-w-2xl"
              >
                <div className="relative flex items-center bg-white/[0.04] rounded-2xl px-5 py-4 border border-white/[0.06] hover:border-[#002395]/30 focus-within:border-[#002395]/40 focus-within:bg-white/[0.06] transition-all shadow-2xl shadow-black/20">
                  <Sparkles size={18} className="text-white/20 mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleMainInput()}
                    placeholder="Poser une question à WS..."
                    className="flex-1 bg-transparent text-white placeholder:text-white/25 outline-none text-base"
                  />
                  <div className="flex items-center gap-2 ml-3">
                    <button className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all">
                      <Mic size={16} className="text-white/40" />
                    </button>
                    <button className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all">
                      <Volume2 size={16} className="text-white/40" />
                    </button>
                    {inputValue.trim() && (
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={handleMainInput}
                        className="w-8 h-8 rounded-xl bg-[#002395]/80 hover:bg-[#002395] flex items-center justify-center transition-all"
                      >
                        <ArrowRight size={16} className="text-white" />
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-3 mt-6"
              >
                {actions.map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActivePanel(action.panel)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-white/[0.06] ${action.hoverBorder} bg-gradient-to-r ${action.color} hover:bg-opacity-150 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm`}
                  >
                    <action.icon size={16} className={action.iconColor} />
                    <span className="text-sm font-medium">{action.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            /* ===== ACTIVE PANEL ===== */
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 flex flex-col relative z-10 px-4 md:px-8 py-4 max-w-4xl mx-auto w-full"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActivePanel(null)}
                    className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-all"
                  >
                    <X size={16} className="text-white/50" />
                  </button>
                  <h2 className="text-lg font-semibold text-white/80">
                    {activePanel === 'image' && 'Créer une image'}
                    {activePanel === 'write' && 'Écrire ou modifier'}
                    {activePanel === 'search' && 'Recherche web'}
                  </h2>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    activePanel === 'image'
                      ? 'bg-violet-400'
                      : activePanel === 'write'
                        ? 'bg-emerald-400'
                        : 'bg-amber-400'
                  }`}
                />
              </div>

              {/* ===== IMAGE PANEL ===== */}
              {activePanel === 'image' && (
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateImage()}
                        placeholder="Décrivez l'image que vous souhaitez créer..."
                        className="w-full bg-white/[0.04] rounded-xl px-4 py-3 text-white placeholder:text-white/25 outline-none border border-white/[0.06] focus:border-violet-500/40 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleGenerateImage}
                      disabled={imageLoading || !imagePrompt.trim()}
                      className="px-5 py-3 rounded-xl bg-violet-500/80 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-500/80 text-white font-medium text-sm flex items-center gap-2 transition-all"
                    >
                      {imageLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <ImageIcon size={16} />
                      )}
                      Générer
                    </motion.button>
                  </div>

                  {imageError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
                      {imageError}
                    </div>
                  )}

                  {imageLoading && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                          <ImageIcon size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-400" />
                        </div>
                        <p className="text-white/40 text-sm">Création en cours...</p>
                      </div>
                    </div>
                  )}

                  {generatedImage && !imageLoading && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex-1 flex flex-col items-center gap-4"
                    >
                      <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl shadow-violet-500/10 max-w-lg">
                        <img
                          src={generatedImage}
                          alt={imagePrompt}
                          className="w-full h-auto"
                        />
                      </div>
                      <p className="text-white/30 text-sm text-center max-w-md">
                        &ldquo;{imagePrompt}&rdquo;
                      </p>
                    </motion.div>
                  )}

                  {!generatedImage && !imageLoading && !imageError && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/10 flex items-center justify-center mx-auto mb-4">
                          <ImageIcon size={32} className="text-violet-400/50" />
                        </div>
                        <p className="text-white/30 text-sm">Décrivez votre image et cliquez Générer</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== WRITE / CHAT PANEL ===== */}
              {activePanel === 'write' && (
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {chatMessages.length === 0 && (
                      <div className="flex-1 flex items-center justify-center h-full min-h-[200px]">
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <PenLine size={32} className="text-emerald-400/50" />
                          </div>
                          <p className="text-white/30 text-sm">Posez une question ou demandez à WS d&apos;écrire quelque chose</p>
                        </div>
                      </div>
                    )}
                    {chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-emerald-500/15 border border-emerald-500/10 text-white/90'
                              : 'bg-white/[0.04] border border-white/[0.06] text-white/80'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-emerald-400/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-emerald-400/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-emerald-400/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input */}
                  <div className="flex gap-3 pt-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                      placeholder="Écrivez votre message..."
                      className="flex-1 bg-white/[0.04] rounded-xl px-4 py-3 text-white placeholder:text-white/25 outline-none border border-white/[0.06] focus:border-emerald-500/40 transition-all"
                    />
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSendChat}
                      disabled={chatLoading || !chatInput.trim()}
                      className="px-4 py-3 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-500/80 text-white transition-all"
                    >
                      <Send size={16} />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* ===== SEARCH PANEL ===== */}
              {activePanel === 'search' && (
                <div className="flex-1 flex flex-col gap-6">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Rechercher sur le web..."
                        className="w-full bg-white/[0.04] rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-white/25 outline-none border border-white/[0.06] focus:border-amber-500/40 transition-all"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSearch}
                      disabled={searchLoading || !searchQuery.trim()}
                      className="px-5 py-3 rounded-xl bg-amber-500/80 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-500/80 text-white font-medium text-sm flex items-center gap-2 transition-all"
                    >
                      {searchLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                      Chercher
                    </motion.button>
                  </div>

                  {searchError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
                      {searchError}
                    </div>
                  )}

                  {searchLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                          <Search size={18} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400" />
                        </div>
                        <p className="text-white/40 text-sm">Recherche en cours...</p>
                      </div>
                    </div>
                  )}

                  {searchResults.length > 0 && !searchLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3 overflow-y-auto max-h-[60vh] custom-scrollbar"
                    >
                      <p className="text-white/30 text-xs uppercase tracking-widest font-medium">
                        {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                      </p>
                      {searchResults.map((result, i) => (
                        <motion.a
                          key={i}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="block bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-amber-500/20 rounded-xl p-4 transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <GlobeIcon className="text-amber-400/60" size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white/80 text-sm font-medium group-hover:text-amber-300 transition-colors truncate">
                                {result.title || 'Sans titre'}
                              </h3>
                              <p className="text-white/20 text-xs truncate mt-0.5">{result.url}</p>
                              <p className="text-white/40 text-sm mt-1.5 line-clamp-2">{result.snippet}</p>
                            </div>
                            <ArrowRight size={14} className="text-white/10 group-hover:text-amber-400/50 transition-colors mt-1 flex-shrink-0" />
                          </div>
                        </motion.a>
                      ))}
                    </motion.div>
                  )}

                  {searchResults.length === 0 && !searchLoading && !searchError && (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/10 flex items-center justify-center mx-auto mb-4">
                          <Search size={32} className="text-amber-400/50" />
                        </div>
                        <p className="text-white/30 text-sm">Tapez votre recherche et cliquez Chercher</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto px-4 py-4 text-center relative z-10">
          <p className="text-white/15 text-xs">
            WS peut faire des erreurs. Envisagez de vérifier les informations importantes.
          </p>
        </footer>
      </main>
    </div>
  )
}

function GlobeIcon({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}
