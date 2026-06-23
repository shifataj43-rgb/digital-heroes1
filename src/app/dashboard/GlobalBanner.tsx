'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function GlobalBanner({ isSubscribed }: { isSubscribed: boolean }) {
  const [isVisible, setIsVisible] = useState(!isSubscribed)

  if (!isVisible || isSubscribed) return null

  return (
    <div className="bg-rose-500/20 border-b border-rose-500/30 px-8 py-3 flex items-center justify-between z-20 relative shrink-0">
      <div className="flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
        <p className="text-sm font-medium text-rose-200">
          Subscription Inactive &mdash; You need an active subscription to participate in upcoming jackpot draws.
        </p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Link href="/dashboard/billing" className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-black text-xs font-bold rounded-lg transition-colors">
          Subscribe Now
        </Link>
        <button 
          onClick={() => setIsVisible(false)} 
          className="text-rose-400 hover:text-rose-300 transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
