import { createClient, getAdminClient } from '@/lib/supabase/server'
import { Trophy, Plus } from 'lucide-react'
import { addScore } from './actions'
import ScoreRow from './ScoreRow'

export const dynamic = 'force-dynamic'

export default async function ScoresPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const adminSupabase = await getAdminClient()
  
  // Real-time subscription status check on every authenticated request
  const { data: profile } = await adminSupabase.from('profiles').select('subscription_status').eq('id', user.id).single()
  
  if (profile?.subscription_status !== 'active') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl font-light mb-2">Subscription Required</h1>
          <p className="text-zinc-400 max-w-md mx-auto">You must maintain an active subscription to access the Score Management interface and participate in the monthly draws.</p>
        </div>
      </div>
    )
  }

  const { data: scores } = await adminSupabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-emerald-400" />
          Score Management
        </h1>
        <p className="text-zinc-400 mt-2">
          Your "ticket" into the monthly draw is your last 5 Stableford scores. 
          If you add a 6th score, your oldest score will be automatically removed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Entry Form */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl sticky top-8">
            <h2 className="text-xl font-medium mb-6">Enter New Score</h2>
            <form action={addScore} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Date Played</label>
                <input 
                  type="date" 
                  name="date"
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Stableford Points (1-45)</label>
                <input 
                  type="number" 
                  name="score"
                  min="1"
                  max="45"
                  required
                  placeholder="36"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <button className="w-full mt-4 bg-white text-zinc-950 hover:bg-zinc-200 font-medium rounded-lg px-4 py-3 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                <Plus className="w-4 h-4" />
                Save Score
              </button>
              
              {searchParams?.error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                  {searchParams.error}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Score History */}
        <div className="lg:col-span-2">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl">
            <h2 className="text-xl font-medium mb-6">Your Last 5 Scores</h2>
            
            {scores && scores.length > 0 ? (
              <div className="space-y-4">
                {scores.map((score) => (
                  <ScoreRow key={score.id} score={score} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-500 border border-dashed border-white/10 rounded-xl">
                <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p>No scores entered yet.</p>
                <p className="text-sm mt-1">Your recent rounds will appear here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
