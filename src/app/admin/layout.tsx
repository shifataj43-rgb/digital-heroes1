import { createClient, getAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  LayoutDashboard, Users, CreditCard, Trophy, 
  Settings, Heart, Medal, BarChart3, LogOut
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from '@/app/auth/actions'
import AdminNotifications, { NotificationType } from './AdminNotifications'
import AdminProfileDropdown from './AdminProfileDropdown'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminSupabase = await getAdminClient()
  const { data: profile } = await adminSupabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white">
        <h1 className="text-3xl font-light mb-4">Access Denied</h1>
        <p className="text-zinc-400 mb-8">You do not have administrator privileges.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-white text-zinc-950 rounded-lg">Return to Dashboard</Link>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })

  // Generate dynamic notifications
  const notifications: NotificationType[] = []
  
  // 1. Pending verifications
  const { data: pendingVerifications } = await adminSupabase
    .from('winner_verifications')
    .select('id, created_at, profiles(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3)
    
  pendingVerifications?.forEach(v => {
    notifications.push({
      id: `verify-${v.id}`,
      title: 'Action Required: Verify Winner',
      message: `${v.profiles?.full_name || 'A user'} has submitted payout proof.`,
      time: new Date(v.created_at).toLocaleString(),
      type: 'alert',
      read: false
    })
  })

  // 2. New Subscriptions (or users created in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { data: newUsers } = await adminSupabase
    .from('profiles')
    .select('id, full_name, created_at')
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(3)

  newUsers?.forEach(u => {
    notifications.push({
      id: `user-${u.id}`,
      title: 'New User Registration',
      message: `${u.full_name || 'A new user'} just joined the platform.`,
      time: new Date(u.created_at).toLocaleString(),
      type: 'user',
      read: false
    })
  })
  
  // 3. System Notification
  notifications.push({
    id: 'system-1',
    title: 'Platform Online',
    message: 'All systems are running smoothly. Ready for the next draw.',
    time: new Date().toLocaleString(),
    type: 'success',
    read: true
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex selection:bg-emerald-500/30">
      {/* 10. Sidebar Navigation */}
      <aside className="w-64 border-r border-white/5 bg-zinc-900/10 backdrop-blur-3xl hidden md:flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-500" />
            Admin Portal
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Users className="w-5 h-5" /> Users
          </Link>
          <Link href="/admin/draws" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Trophy className="w-5 h-5" /> Draw Management
          </Link>
          <Link href="/admin/charities" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Heart className="w-5 h-5" /> Charities
          </Link>
          <Link href="/admin/winners" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <Medal className="w-5 h-5" /> Winners
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
            <BarChart3 className="w-5 h-5" /> Reports and Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950 -z-10" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-900/10 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        {/* 1. Header Section */}
        <header className="h-20 border-b border-white/5 bg-transparent flex items-center justify-between px-8 z-10 relative">
          <div>
            <h1 className="text-xl font-medium">Welcome, Admin</h1>
            <p className="text-sm text-zinc-400">{currentDate}</p>
          </div>
          
          <div className="flex items-center gap-6">
            <AdminNotifications initialNotifications={notifications} />
            <AdminProfileDropdown profile={profile} />
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 relative z-0">
          {children}
        </div>
      </main>
    </div>
  )
}
