import { getAdminClient } from '@/lib/supabase/server'
import { Heart, Globe } from 'lucide-react'
import Link from 'next/link'
import CharityList from './CharityList'

export const dynamic = 'force-dynamic'

export default async function CharitiesPage() {
  const supabase = await getAdminClient()
  const { data: charities } = await supabase.from('charities').select('*')
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
      
      {/* Navigation Bar */}
      <nav className="w-full z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-medium tracking-tight text-xl">Digital Heroes</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium px-5 py-2.5 bg-amber-400 text-zinc-950 rounded-full hover:bg-amber-300 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              Join the Club
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-sm text-emerald-300 mb-6 backdrop-blur-md">
            <Heart className="w-4 h-4 text-emerald-400" />
            <span className="font-medium uppercase text-xs tracking-widest">Our Causes</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-light tracking-tight mb-6 drop-shadow-lg">
            Empowering Change on the <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Fairways</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            Every swing makes an impact. Explore the incredible organizations supported by our community of golfers. A portion of every subscription goes directly to funding their missions.
          </p>
        </div>
      </section>

      {/* Charity Grid with Search & Filter */}
      <section className="py-12 pb-32">
        <CharityList initialCharities={charities || []} />
      </section>

    </div>
  )
}
