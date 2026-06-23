import { getAdminClient } from '@/lib/supabase/server'
import { BarChart3, Users, Trophy, Heart, Activity } from 'lucide-react'

export default async function ReportsPage() {
  const adminSupabase = await getAdminClient()

  // 1. Total Users
  const { count: userCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true })
  
  // 2. Draw Statistics & Total Prize Pool
  const { data: draws } = await adminSupabase.from('draws').select('*').order('created_at', { ascending: false })
  
  const totalPrizePool = draws?.reduce((acc, draw) => acc + Number(draw.total_prize_pool), 0) || 0
  
  // 3. Charity Contributions (Calculated dynamically)
  // Get active subscriptions to calculate total revenue
  const { data: subscriptions } = await adminSupabase.from('subscriptions').select('amount').eq('status', 'active')
  
  let currentMonthRevenue = 0
  if (subscriptions && subscriptions.length > 0) {
    currentMonthRevenue = subscriptions.reduce((sum, sub) => sum + Number(sub.amount), 0)
  } else {
    // Fallback if subscriptions table is empty
    const { count: activeSubs } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
    currentMonthRevenue = (activeSubs || 0) * 29
  }

  // Charity is explicitly 10% of subscription revenue as per PRD
  const totalCharityContributions = currentMonthRevenue * 0.10 

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-emerald-400" />
          Reports & Analytics
        </h1>
        <p className="text-zinc-400 mt-2">Platform statistics, financials, and historical draw data.</p>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-20 h-20" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Users className="w-4 h-4 text-emerald-400" /> Total Users
          </div>
          <div className="text-5xl font-light text-white">{userCount || 0}</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-20 h-20" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Trophy className="w-4 h-4 text-amber-400" /> Cumulative Prize Pool
          </div>
          <div className="text-5xl font-light text-amber-400">${totalPrizePool.toLocaleString()}</div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 relative overflow-hidden flex flex-col justify-between h-40">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Heart className="w-20 h-20" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Heart className="w-4 h-4 text-rose-400" /> Charity Contributions (Est)
          </div>
          <div className="text-5xl font-light text-rose-400">${totalCharityContributions.toLocaleString()}</div>
        </div>
      </div>

      {/* Draw Statistics */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
        <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          Historical Draw Statistics
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium text-zinc-400">Date</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Winning Numbers</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Total Prize Pool</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Jackpot Rollover</th>
                <th className="px-6 py-4 font-medium text-zinc-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {draws && draws.length > 0 ? (
                draws.map((draw) => {
                  const monthName = new Date(2000, draw.month - 1).toLocaleString('default', { month: 'long' })
                  return (
                    <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-300">
                        {monthName} {draw.year}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5">
                          {draw.winning_numbers?.map((num: number, idx: number) => (
                            <div key={idx} className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                              {num}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-emerald-400 font-medium">
                        ${Number(draw.total_prize_pool).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-amber-400">
                        ${Number(draw.jackpot_carried_over).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          {draw.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No draws have been published yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
