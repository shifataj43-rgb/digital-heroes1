'use client'

import { useState } from 'react'
import { MoreVertical, X, LayoutDashboard, Trophy, Heart, CreditCard, Medal, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/auth/actions'

export default function MobileSidebar({ isAdmin }: { isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden flex items-center">
      <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
        <MoreVertical className="w-6 h-6" />
      </button>
      <div className="flex items-center ml-2">
        <Trophy className="w-6 h-6 text-emerald-500 mr-2" />
        <span className="font-semibold tracking-tight text-white">Digital Heroes</span>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={closeMenu} />
          
          {/* Sidebar */}
          <div className="relative w-72 bg-zinc-950 border-r border-white/10 shadow-2xl flex flex-col h-full z-[9999]">
            <div className="p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="font-semibold text-white">Digital Heroes</span>
              </div>
              <button onClick={closeMenu} className="p-2 text-zinc-400 hover:text-white rounded-lg bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
              <Link href="/dashboard" onClick={closeMenu} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Overview</span>
              </Link>
              <Link href="/dashboard/scores" onClick={closeMenu} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/scores' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                <Trophy className="w-5 h-5" />
                <span className="font-medium">My Scores</span>
              </Link>
              <Link href="/dashboard/charity" onClick={closeMenu} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/dashboard/charity') ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                <Heart className="w-5 h-5" />
                <span className="font-medium">Charity</span>
              </Link>
              <Link href="/dashboard/billing" onClick={closeMenu} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/billing' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Subscription</span>
              </Link>
              <Link href="/dashboard/winners" onClick={closeMenu} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${pathname === '/dashboard/winners' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}>
                <Medal className="w-5 h-5" />
                <span className="font-medium">My Winnings</span>
              </Link>
              
              {isAdmin && (
                <>
                  <div className="pt-4 mt-4 border-t border-white/5" />
                  <div className="px-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-2">Administration</div>
                  <Link href="/admin" onClick={closeMenu} className="flex items-center gap-4 px-4 py-3 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Admin Panel</span>
                  </Link>
                </>
              )}
            </div>
            
            <div className="p-6 border-t border-white/10">
              <form action={signOut}>
                <button type="submit" className="flex w-full items-center gap-4 px-4 py-3 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
