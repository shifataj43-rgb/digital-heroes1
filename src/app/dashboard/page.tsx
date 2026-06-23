import { createClient, getAdminClient } from '@/lib/supabase/server'
import { Trophy, ArrowRight, Heart, Calendar, Gift, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import DashboardCards from './DashboardCards'

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const adminSupabase = await getAdminClient()

  // --- TEMPORARY SEED LOGIC ---
  const { data: existingCharities } = await adminSupabase.from('charities').select('id').limit(1)
  if (!existingCharities || existingCharities.length === 0) {
    const charitiesToSeed = [
      { name: "Global Green", description: "Planting trees to offset carbon footprints of golf courses worldwide.", image_url: "https://images.unsplash.com/photo-1593111774240-d529f12cb416?q=80&w=800&auto=format&fit=crop" },
      { name: "Ocean Clean Initiative", description: "Removing plastics from our oceans to preserve marine life for future generations.", image_url: "https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?q=80&w=800&auto=format&fit=crop" },
      { name: "Youth Sports Link", description: "Providing underprivileged youth with access to sports equipment and mentorship.", image_url: "https://images.unsplash.com/photo-1535136124503-45eb4dbd0b04?q=80&w=800&auto=format&fit=crop" },
      { name: "Veterans on the Green", description: "Using golf as a therapeutic outlet for wounded veterans returning home.", image_url: "https://images.unsplash.com/photo-1535139262971-c5184570f7d5?q=80&w=800&auto=format&fit=crop" },
      { name: "Fairways for Cancer", description: "Funding cancer research and patient care through nationwide golf tournaments.", image_url: "https://images.unsplash.com/photo-1593111774653-731398ea76d8?q=80&w=800&auto=format&fit=crop" },
      { name: "Wildlife Rescue Coalition", description: "Protecting endangered wildlife and preserving natural habitats around the globe.", image_url: "https://images.unsplash.com/photo-1517594422361-5e18d04cfd8b?q=80&w=800&auto=format&fit=crop" },
      { name: "Water for All", description: "Building sustainable clean water sources for communities in developing nations.", image_url: "https://images.unsplash.com/photo-1519335359740-3375c8793b82?q=80&w=800&auto=format&fit=crop" },
      { name: "Education First Fund", description: "Providing scholarships, books, and technology to schools in underserved districts.", image_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" },
      { name: "Animal Haven", description: "Rescuing and rehabilitating abandoned pets and farm animals.", image_url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=800&auto=format&fit=crop" },
      { name: "Disaster Relief Network", description: "Delivering emergency food, shelter, and medical supplies to disaster zones.", image_url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop" }
    ];
    for (const c of charitiesToSeed) {
      await adminSupabase.from('charities').insert([c]);
    }
  }
  // -----------------------------

  // Fetch user profile
  const { data: profile } = await adminSupabase.from('profiles').select('*, charities(name)').eq('id', user.id).single()
  
  // Fetch latest scores
  const { data: scores } = await adminSupabase.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5)
  
  const isActive = profile?.subscription_status === 'active'

  // Fetch winnings data
  const { data: winnings } = await adminSupabase
    .from('winners')
    .select('*')
    .eq('user_id', user.id)

  const pendingWin = winnings?.find(w => w.status === 'pending' || w.status === 'proof_submitted' || w.status === 'proof_rejected')
  const totalWon = winnings?.reduce((sum, w) => sum + Number(w.prize_amount), 0) || 0
  const paymentStatus = pendingWin ? (pendingWin.status === 'proof_rejected' ? 'Action Required' : 'Pending Review') : 'Up to date'
  
  // Fetch actual historical draws entered
  const { count: drawsEnteredCount } = await adminSupabase
    .from('draw_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  
  const drawsEntered = drawsEnteredCount || 0
  
  const upcomingDrawDate = new Date()
  if (upcomingDrawDate.getDate() >= 28) {
    upcomingDrawDate.setMonth(upcomingDrawDate.getMonth() + 1)
  }
  upcomingDrawDate.setDate(28)
  
  // Calculate renewal date (mocked: 30 days from created_at if active)
  const renewalDate = new Date(profile?.created_at || Date.now())
  renewalDate.setDate(renewalDate.getDate() + 30)

  // Determine if it's a new account (created in the last 24 hours)
  const isNewAccount = profile?.created_at && (Date.now() - new Date(profile.created_at).getTime() < 24 * 60 * 60 * 1000)

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-3">{isNewAccount ? 'Welcome' : 'Welcome Back'}, <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 capitalize">{profile?.full_name?.split(' ')[0] || 'Golfer'}</span>.</h1>
        <p className="text-zinc-400 text-lg font-light">Here is your complete impact, performance, and draw overview.</p>
      </div>

      {/* Subscription Status Banner */}
      {isActive ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="font-medium text-emerald-300">Active Subscription</h3>
              <p className="text-sm text-emerald-400/80">Renews on {renewalDate.toLocaleDateString()}</p>
            </div>
          </div>
          <Link href="/dashboard/billing" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">
            Manage Billing →
          </Link>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-emerald-300">Subscription Inactive</h3>
            <p className="text-sm text-emerald-400/80">You need an active subscription to participate in the monthly draws and support your charity.</p>
          </div>
          <Link href="/dashboard/billing" className="whitespace-nowrap px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-lg transition-all">
            Activate Now
          </Link>
        </div>
      )}

      {isActive && (
        <>
          {/* Winner Verification Banner (Dynamic) */}
          {pendingWin && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-zinc-900/50 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_30px_rgba(245,158,11,0.1)] mb-6">
              <div className="flex-1">
                <h3 className="text-xl font-medium text-amber-300 mb-2">
                  {pendingWin.match_type === '5-match' ? '🚨 CONGRATULATIONS! YOU WON THE JACKPOT! 🚨' : 'Congratulations! You won!'}
                </h3>
                <p className="text-sm text-zinc-300">
                  You won a {pendingWin.match_type} prize of ${Number(pendingWin.prize_amount).toFixed(2)}. 
                  {pendingWin.status === 'proof_rejected' ? ' Your previous proof was rejected. Please upload a clearer screenshot.' : 
                   pendingWin.proof_image_url ? ' Your proof has been submitted and is awaiting verification by the administration team.' : 
                   ' Please upload a screenshot of your official golf handicap platform showing your recent scores to verify your eligibility and claim your payout.'}
                </p>
              </div>
              <div className="w-full md:w-auto">
                <Link href="/dashboard/winners" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold rounded-lg flex items-center justify-center transition-all w-full md:w-auto">
                  {pendingWin.proof_image_url ? 'Check Status' : 'Upload Proof'}
                </Link>
              </div>
            </div>
          )}

          <DashboardCards 
            drawsEntered={drawsEntered} 
            upcomingDrawDate={upcomingDrawDate} 
            scores={scores} 
            totalWon={totalWon} 
            paymentStatus={paymentStatus} 
            profile={profile} 
          />
        </>
      )}
    </div>
  )
}
