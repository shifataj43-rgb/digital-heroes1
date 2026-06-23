import Link from 'next/link'
import { Heart, ArrowRight, Activity, ShieldCheck, Flag } from 'lucide-react'
import Image from 'next/image'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

import { getAdminClient } from '@/lib/supabase/server'

export default async function Home() {
  const adminSupabase = await getAdminClient()
  const { data: charities } = await adminSupabase.from('charities').select('*').order('name')

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-emerald-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-zinc-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Flag className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-medium tracking-tight text-xl">Digital Heroes</span>
          </div>
          <div className="flex items-center gap-6">

            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium px-5 py-2.5 bg-amber-400 text-zinc-950 rounded-full hover:bg-amber-300 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]">
              Join the Club
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image & Gradient */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/hero.png" 
            alt="Pristine Golf Course at Sunrise" 
            fill 
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/60 via-zinc-950/80 to-zinc-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-sm text-emerald-300 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Heart className="w-4 h-4 text-emerald-400" />
            <span className="font-medium tracking-wide uppercase text-xs">Play golf. Make an impact.</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight max-w-5xl mx-auto mb-8 leading-tight drop-shadow-2xl">
            Elevate your game.<br/>
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-200">
              Empower your cause.
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-300 max-w-3xl mx-auto mb-12 font-light leading-relaxed drop-shadow-md">
            A premium subscription for the modern golfer. Track your scores on the golf course, enter monthly prize draws, and easily donate to a charity of your choice.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="group w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1">
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-full font-medium flex items-center justify-center transition-all hover:-translate-y-1">
              Explore the Club
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Charities Grid */}
      <section className="py-24 border-t border-white/5 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-tight mb-4">Play for a Purpose</h2>
            <p className="text-zinc-400 font-light text-xl max-w-3xl mx-auto">
              Every swing has the power to change a life. Here are the incredible organizations you can choose to support with your membership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities?.map((charity) => (
              <div key={charity.id} className="rounded-2xl bg-zinc-900/40 border border-white/5 overflow-hidden flex flex-col shadow-xl hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 group">
                <div className="relative h-48 w-full overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={charity.image_url || '/images/charity.png'} 
                    alt={charity.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-medium mb-2">{charity.name}</h3>
                  <p className="text-zinc-400 text-sm flex-1">{charity.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-tight mb-4">How It Works</h2>
            <p className="text-zinc-400 font-light text-xl">Three simple steps to elevate your game and your impact.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 group shadow-xl hover:shadow-emerald-900/20">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                <Activity className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-medium mb-4">1. Track Performance</h3>
              <p className="text-zinc-400 font-light leading-relaxed text-lg">
                Log your last 5 Stableford scores. The system automatically maintains your rolling history, discarding the oldest rounds to keep your profile active on the leaderboard.
              </p>
            </div>
            
            <div className="p-10 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-2 group shadow-xl hover:shadow-amber-900/20">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:bg-amber-500/20 transition-colors">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-2xl font-medium mb-4">2. Enter the Draw</h3>
              <p className="text-zinc-400 font-light leading-relaxed text-lg">
                Your 5 scores act as your "ticket". Every month, our algorithm draws winning numbers. Match 3, 4, or 5 numbers to win a share of the massive prize pool.
              </p>
            </div>
            
            <div className="p-10 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-teal-500/30 transition-all duration-300 hover:-translate-y-2 group shadow-xl hover:shadow-teal-900/20">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 group-hover:bg-teal-500/20 transition-colors">
                <Heart className="w-7 h-7 text-teal-400" />
              </div>
              <h3 className="text-2xl font-medium mb-4">3. Support Charities</h3>
              <p className="text-zinc-400 font-light leading-relaxed text-lg">
                A minimum of 10% of your subscription goes directly to a cause of your choosing. You play, you win, and the world benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950/20 border-y border-emerald-500/10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl font-light tracking-tight mb-6 text-white">Ready to join the club?</h2>
          <p className="text-zinc-300 mb-12 font-light text-xl">Join thousands of golfers making a real-world impact while competing for monthly jackpots.</p>
          <Link href="/signup" className="px-10 py-5 bg-amber-400 text-zinc-950 rounded-full font-semibold text-lg hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_40px_rgba(251,191,36,0.6)]">
            Become a Member
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-zinc-950 text-center text-zinc-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flag className="w-4 h-4 text-zinc-600" />
          <span className="font-semibold tracking-wide">Digital Heroes</span>
        </div>
        <p>© 2026 Digital Heroes Golf Club. All rights reserved.</p>
      </footer>
    </div>
  )
}
