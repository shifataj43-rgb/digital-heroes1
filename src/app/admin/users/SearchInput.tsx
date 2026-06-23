'use client'

import { Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'

export default function SearchInput() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  // Use local state to make typing instant
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '')

  useEffect(() => {
    // Debounce the URL update by 300ms
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      if (searchTerm) {
        params.set('q', searchTerm)
      } else {
        params.delete('q')
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, pathname, router, searchParams])

  return (
    <div className="relative">
      <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${isPending ? 'text-emerald-500 animate-pulse' : 'text-zinc-500'}`} />
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..." 
        className="bg-zinc-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-64 transition-all" 
      />
    </div>
  )
}
