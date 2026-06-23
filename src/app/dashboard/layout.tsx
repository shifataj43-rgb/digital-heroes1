import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Trophy, Heart, CreditCard, Settings, LogOut, Medal, User } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import GlobalBanner from './GlobalBanner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Check if admin using bypass to overcome missing RLS
  const { getAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await getAdminClient()
  const { data: profile } = await adminSupabase.from('profiles').select('role, subscription_status').eq('id', user.id).single()
  const isAdmin = profile?.role === 'admin'
  const isSubscribed = profile?.subscription_status === 'active'

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex selection:bg-emerald-500/30">
      {/* Enhanced Sidebar with Glassmorphism */}
      <aside className="w-72 border-r border-white/5 bg-zinc-950/40 backdrop-blur-3xl hidden md:flex flex-col relative z-20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-10 pointer-events-none" />
        
        <div className="p-8 relative z-10">
          <Link href="/dashboard" className="text-2xl font-semibold tracking-tight text-white flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Trophy className="w-5 h-5 text-emerald-400" />
            </div>
            Digital Heroes
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-3 relative z-10">
          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Overview</span>
          </Link>
          <Link href="/dashboard/scores" className="flex items-center gap-4 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform text-teal-400/70 group-hover:text-teal-400" />
            <span className="font-medium">My Scores</span>
          </Link>
          <Link href="/dashboard/charity" className="flex items-center gap-4 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform text-rose-400/70 group-hover:text-rose-400" />
            <span className="font-medium">Charity</span>
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-4 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Subscription</span>
          </Link>
          <Link href="/dashboard/winners" className="flex items-center gap-4 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
            <Medal className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-400/70 group-hover:text-amber-400" />
            <span className="font-medium">My Winnings</span>
          </Link>
          
          {isAdmin && (
            <>
              <div className="pt-6 mt-6 border-t border-white/5" />
              <div className="px-4 text-xs font-semibold text-zinc-600 uppercase tracking-widest mb-3">Administration</div>
              <Link href="/admin" className="flex items-center gap-4 px-4 py-3 text-emerald-400/80 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all group border border-transparent hover:border-emerald-500/20">
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                <span className="font-medium">Admin Panel</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-6 border-t border-white/5 relative z-10">
          <form action={signOut}>
            <button className="flex w-full items-center gap-4 px-4 py-3 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all group">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#09090b] to-[#09090b] -z-20" />
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-900/15 rounded-full blur-[150px] -z-10 translate-x-1/4 -translate-y-1/4 pointer-events-none" />
        
        {/* Header Section */}
        <header className="h-24 border-b border-white/5 bg-transparent flex items-center justify-between px-10 z-10 relative shrink-0">
          <div className="hidden md:block">
            {/* Can leave empty or add breadcrumb */}
          </div>
          <div className="md:hidden flex items-center">
            <Trophy className="w-8 h-8 text-emerald-500 mr-3" />
            <span className="font-semibold text-lg tracking-tight">Digital Heroes</span>
          </div>
          
          <div className="flex items-center gap-6 ml-auto">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-5 py-2.5 text-zinc-300 hover:text-white bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-full transition-all shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/30 group">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                <User className="w-4 h-4 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </div>
              <span className="hidden sm:inline font-medium text-sm">Profile & Settings</span>
            </Link>
          </div>
        </header>

        <GlobalBanner isSubscribed={isSubscribed} />

        <div className="flex-1 overflow-auto p-10 relative z-0 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  )
}
