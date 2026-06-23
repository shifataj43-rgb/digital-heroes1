import { createClient, getAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Medal, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import ProofUploadForm from './ProofUploadForm'

export default async function MyWinningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's winnings
  const adminSupabase = await getAdminClient()
  const { data: winnings } = await adminSupabase
    .from('winners')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Medal className="w-8 h-8 text-amber-400" />
          My Winnings
        </h1>
        <p className="text-zinc-400 mt-2">Track your draw winnings and complete eligibility verification to claim your payouts.</p>
      </div>

      <div className="space-y-6">
        {winnings && winnings.length > 0 ? (
          winnings.map((win: any) => {
            const requiresProof = win.status === 'pending' && !win.proof_image_url;
            const isPendingReview = win.status === 'pending' && win.proof_image_url;

            return (
              <div key={win.id} className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                  
                  {/* Left Side: Win Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        {win.match_type} Winner
                      </span>
                      <span className="text-sm text-zinc-400">{win.draw_month} Draw</span>
                    </div>
                    <h2 className="text-3xl font-light text-white pt-2">${Number(win.prize_amount).toLocaleString()}</h2>
                  </div>

                  {/* Right Side: Status / Action */}
                  <div className="w-full md:w-1/2">
                    {win.status === 'paid' ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                          <p className="font-medium text-emerald-400">Payout Completed</p>
                          <p className="text-sm text-emerald-400/80">Funds have been transferred to your account.</p>
                        </div>
                      </div>
                    ) : win.status === 'approved' ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle2 className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                          <p className="font-medium text-emerald-400">Proof Approved</p>
                          <p className="text-sm text-emerald-400/80">Awaiting final payout transfer from administration.</p>
                        </div>
                      </div>
                    ) : win.status === 'rejected' ? (
                      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                        <div className="p-2 bg-rose-500/20 rounded-lg"><AlertCircle className="w-5 h-5 text-rose-400" /></div>
                        <div>
                          <p className="font-medium text-rose-400">Proof Rejected</p>
                          <p className="text-sm text-rose-400/80">Your submission was invalid. Please contact support.</p>
                        </div>
                      </div>
                    ) : isPendingReview ? (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded-lg"><Clock className="w-5 h-5 text-amber-400" /></div>
                        <div>
                          <p className="font-medium text-amber-400">Pending Review</p>
                          <p className="text-sm text-amber-400/80">Your proof has been submitted and is awaiting verification.</p>
                        </div>
                      </div>
                    ) : requiresProof ? (
                      <ProofUploadForm winId={win.id} />
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-white/10">
            <Medal className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-300">No Winnings Yet</h3>
            <p className="text-zinc-500 mt-2 max-w-sm mx-auto">Participate in monthly draws by keeping your subscription active and submitting your scores.</p>
          </div>
        )}
      </div>
    </div>
  )
}
