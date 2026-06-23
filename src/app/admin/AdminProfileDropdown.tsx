'use client'

import { useState, useRef, useEffect } from 'react'
import { LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'

export default function AdminProfileDropdown({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative pl-6 border-l border-white/10" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center font-medium text-emerald-300">
          {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium">{profile?.full_name || 'System Admin'}</p>
          <p className="text-xs text-zinc-400">Administrator</p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-56 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-white/10 mb-2">
            <p className="text-sm font-medium text-white">{profile?.full_name || 'System Admin'}</p>
            <p className="text-xs text-zinc-400">{profile?.role || 'Administrator'}</p>
          </div>
          
          <Link 
            href="/admin/settings" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <User className="w-4 h-4" /> My Profile
          </Link>

          <div className="h-px bg-white/10 my-2" />

          <form action={signOut}>
            <button 
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
