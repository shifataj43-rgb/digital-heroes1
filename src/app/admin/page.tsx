import { getAdminClient } from '@/lib/supabase/server'
import { 
  Users, Heart, Trophy, Clock, CreditCard, 
  ArrowRight, Plus, Activity, CheckCircle, Search, Mail
} from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const adminSupabase = await getAdminClient()

  // 2. Top Statistics Data
  const { count: userCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true })
  
  const { data: activeProfiles } = await adminSupabase.from('profiles').select('subscription_tier, currency').eq('subscription_status', 'active')
  const activeSubs = activeProfiles?.length || 0
  
  let totalSubRevenueUSD = 0
  let totalSubRevenueINR = 0
  
  activeProfiles?.forEach(p => {
    const cur = p.currency || 'USD'
    const amt = p.subscription_tier === 'yearly' ? (cur === 'INR' ? 4999/12 : 99/12) : (cur === 'INR' ? 499 : 9.99)
    if (cur === 'USD') totalSubRevenueUSD += amt
    if (cur === 'INR') totalSubRevenueINR += amt
  })
  
  const prizePoolUSD = totalSubRevenueUSD * 0.30
  const charityTotalUSD = totalSubRevenueUSD * 0.10
  
  const prizePoolINR = totalSubRevenueINR * 0.30
  const charityTotalINR = totalSubRevenueINR * 0.10
  
  // Pending winner verifications
  const { count: pendingVerificationsCount } = await adminSupabase.from('winners').select('*', { count: 'exact', head: true }).eq('status', 'pending').not('proof_image_url', 'is', null)
  const pendingVerifications = pendingVerificationsCount || 0
  
  // Subscription status counts
  const { count: canceledSubs } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'canceled')
  const { count: inactiveSubs } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'inactive')

  // 3. User Management Overview Data
  const { data: recentUsers } = await adminSupabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  // 5. Draw Data
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const yearName = now.getFullYear();
  
  const currentDraw = {
    name: `${monthName} ${yearName} Draw`,
    status: "Pending",
    participants: activeSubs || 0,
    prizePoolUSD: prizePoolUSD,
    prizePoolINR: prizePoolINR,
    type: "Algorithm"
  }

  // 6. Real Winner Data
  const { data: recentWinners } = await adminSupabase
    .from('winners')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(3)

  // 7. Charity Data
  const { data: rawCharities } = await adminSupabase.from('charities').select('*')
  const { count: charityCount } = await adminSupabase.from('charities').select('*', { count: 'exact', head: true })

  // Calculate real support counts for each charity
  const charitiesWithSupport = await Promise.all((rawCharities || []).map(async (c) => {
    const { count } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('charity_id', c.id)
    return { ...c, supporters: count || 0 }
  }))
  // Sort by supporters and take top 3
  const topCharities = charitiesWithSupport.sort((a, b) => b.supporters - a.supporters).slice(0, 3)

  // 8. Monthly Growth Analytics (Real data)
  const { data: allProfiles } = await adminSupabase.from('profiles').select('created_at')
  const monthlyCounts = Array(7).fill(0)
  const currentMonthDate = new Date()
  
  allProfiles?.forEach(p => {
    const d = new Date(p.created_at)
    const monthDiff = currentMonthDate.getMonth() - d.getMonth() + (12 * (currentMonthDate.getFullYear() - d.getFullYear()))
    if (monthDiff >= 0 && monthDiff < 7) {
      monthlyCounts[6 - monthDiff]++ // 6 is the current month (last item)
    }
  })
  
  const maxGrowth = Math.max(...monthlyCounts, 10) // Minimum scale of 10
  
  // Generate labels for the last 7 months
  const monthLabels = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (6 - i))
    return d.toLocaleString('default', { month: 'short' })
  })

  return (
    <div className="space-y-10 pb-12 max-w-[1600px] mx-auto">
      
      {/* 2. Top Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Revenue Overview */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-emerald-900/20 group flex flex-col justify-between h-auto min-h-[144px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><CreditCard className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Revenue Overview
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-sm font-medium text-zinc-500">INR Revenue:</span>
              <span className="text-xl font-light text-emerald-400">₹{totalSubRevenueINR.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-500">USD Revenue:</span>
              <span className="text-xl font-light text-emerald-400">${totalSubRevenueUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Charity Contribution */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl hover:border-rose-500/30 transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-rose-900/20 group flex flex-col justify-between h-auto min-h-[144px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Heart className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-4">
            <Heart className="w-4 h-4 text-rose-400" /> Charity Contribution
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-sm font-medium text-zinc-500">INR Charity:</span>
              <span className="text-xl font-light text-rose-400">₹{charityTotalINR.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-500">USD Charity:</span>
              <span className="text-xl font-light text-rose-400">${charityTotalUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Prize Pool */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-amber-900/20 group flex flex-col justify-between h-auto min-h-[144px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-4">
            <Trophy className="w-4 h-4 text-amber-400" /> Prize Pool
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-sm font-medium text-zinc-500">INR Prize Pool:</span>
              <span className="text-xl font-light text-amber-400">₹{prizePoolINR.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-500">USD Prize Pool:</span>
              <span className="text-xl font-light text-amber-400">${prizePoolUSD.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-emerald-900/20 group flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Users className="w-4 h-4 text-emerald-400" /> Total Users
          </div>
          <div className="text-4xl font-light text-white">{userCount}</div>
        </div>
        
        {/* Active Subscribers */}
        <div className="p-6 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 shadow-xl hover:shadow-emerald-900/20 group flex flex-col justify-between h-36 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Activity className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
            <Activity className="w-4 h-4 text-emerald-400" /> Active Subscribers
          </div>
          <div className="text-4xl font-light text-white">{activeSubs}</div>
        </div>

        {/* Pending Verifications */}
        <Link href="/admin/winners" className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 backdrop-blur-xl hover:border-amber-400/40 transition-all duration-500 hover:-translate-y-1 shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col justify-between h-36 relative overflow-hidden cursor-pointer block">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Clock className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 text-sm font-medium text-amber-500">
            <Clock className="w-4 h-4" /> Pending Verifications
          </div>
          <div className="text-4xl font-light text-amber-400">{pendingVerifications}</div>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* 3. User Management Overview Section */}
        <div className="xl:col-span-2 p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl shadow-xl hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All Users</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-zinc-500 border-b border-white/5">
                  <th className="pb-3 font-medium">User Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Join Date</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentUsers?.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {u.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {u.full_name || 'Anonymous'}
                    </td>
                    <td className="py-4 text-zinc-400 flex items-center gap-2"><Mail className="w-3 h-3"/>Hidden</td>
                    <td className="py-4 capitalize text-zinc-300">Monthly</td>
                    <td className="py-4">
                      {u.subscription_status === 'active' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-xs font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="py-4 text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <Link href={`/admin/users/${u.id}`} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors inline-block">Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Subscription Overview Section */}
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl shadow-xl flex flex-col hover:border-white/10 transition-colors">
          <h2 className="text-lg font-medium mb-6">Subscription Analytics</h2>
          
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-zinc-400 text-sm">Active Subscriptions</span>
              <span className="font-medium text-emerald-400">{activeSubs}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-zinc-400 text-sm">Expired / Inactive</span>
              <span className="font-medium text-zinc-300">{inactiveSubs || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-zinc-400 text-sm">Cancelled</span>
              <span className="font-medium text-rose-400">{canceledSubs || 0}</span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-medium text-zinc-400 mb-4">Monthly Growth</h3>
            {/* CSS Sparkline Chart (Real Data) */}
            <div className="h-24 flex items-end justify-between gap-2">
              {monthlyCounts.map((count, i) => {
                const heightPercent = Math.max(10, Math.min(100, (count / maxGrowth) * 100))
                return (
                  <div key={i} className="w-full bg-emerald-500/20 rounded-t-sm relative group hover:bg-emerald-500/40 transition-colors" style={{ height: `${heightPercent}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {count}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              {monthLabels.map((label, i) => (
                <span key={i}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 5. Draw Management Section */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900/30 to-zinc-900/40 backdrop-blur-xl border border-emerald-500/20 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.1)]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <h2 className="text-lg font-medium mb-6 relative z-10 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" /> Current Draw Overview
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
            <div>
              <div className="text-sm text-zinc-400 mb-1">Draw Name</div>
              <div className="font-medium text-lg">{currentDraw.name}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400 mb-1">Status</div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                {currentDraw.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400 mb-1">Eligible Participants</div>
              <div className="font-medium">{currentDraw.participants}</div>
            </div>
            <div>
              <div className="text-sm text-zinc-400 mb-1">Logic Type</div>
              <div className="font-medium">{currentDraw.type}</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/20 border border-white/5 mb-6 relative z-10 flex gap-6">
            <div>
              <div className="text-sm text-emerald-400 font-medium mb-1">Projected USD Pool</div>
              <div className="text-3xl font-light text-white">${currentDraw.prizePoolUSD.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-emerald-400 font-medium mb-1">Projected INR Pool</div>
              <div className="text-3xl font-light text-white">₹{currentDraw.prizePoolINR.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
            <Link href="/admin/draws" className="flex items-center justify-center flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-lg text-sm font-medium transition-colors shadow-lg">
              Run Simulation
            </Link>
            <Link href="/admin/draws" className="flex items-center justify-center flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
              Manage Draw
            </Link>
          </div>
        </div>

        {/* 7. Charity Overview Section */}
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl shadow-xl flex flex-col hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400" /> Charity Impact
            </h2>
            <Link href="/admin/charities" className="text-sm text-rose-400 hover:text-rose-300 font-medium">Manage Charities</Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
              <div className="text-xs text-rose-400/80 mb-1">Total Charities</div>
              <div className="text-2xl font-light">{charityCount}</div>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 flex flex-col justify-center">
              <div className="text-xs text-rose-400/80 mb-1">Total Donated</div>
              <div className="text-xl font-light">${charityTotalUSD.toFixed(2)} / ₹{charityTotalINR.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Top Charities by Support</div>
            {topCharities?.map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <span className="font-medium text-sm">{c.name}</span>
                </div>
                <div className="text-sm text-zinc-400">
                  {c.supporters} {c.supporters === 1 ? 'supporter' : 'supporters'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 6. Winner Management Section */}
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl shadow-xl overflow-hidden hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Recent Winners</h2>
            <Link href="/admin/winners" className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-zinc-500 border-b border-white/5">
                  <th className="pb-3 font-medium">Winner</th>
                  <th className="pb-3 font-medium">Match</th>
                  <th className="pb-3 font-medium">Prize</th>
                  <th className="pb-3 font-medium">Verification</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentWinners && recentWinners.length > 0 ? (
                  recentWinners.map((w: any) => (
                    <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-medium">{w.profiles?.full_name || 'Anonymous'}</td>
                      <td className="py-4 text-amber-400 text-xs font-medium">{w.match_type}</td>
                      <td className="py-4 text-emerald-400 font-medium">${Number(w.prize_amount).toFixed(2)}</td>
                      <td className="py-4">
                        {w.status === 'paid' || w.status === 'approved' ? (
                          <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">Approved</span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs">Pending Proof</span>
                        )}
                      </td>
                      <td className="py-4">
                        {w.status === 'paid' ? (
                          <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">Paid</span>
                        ) : (
                          <span className="px-2 py-1 rounded-md bg-zinc-500/10 text-zinc-400 text-xs">Pending</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {w.status === 'pending' ? (
                          <Link href="/admin/winners" className="inline-block text-center text-xs bg-amber-500 hover:bg-amber-400 text-amber-950 font-medium px-3 py-1.5 rounded-lg transition-colors">Review Proof</Link>
                        ) : w.status === 'approved' ? (
                          <Link href="/admin/winners" className="inline-block text-center text-xs bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-medium px-3 py-1.5 rounded-lg transition-colors">Pay Winner</Link>
                        ) : (
                          <span className="text-xs text-zinc-500">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-500">
                      No recent winners to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 8. Reports and Analytics Section */}
        <div className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl shadow-xl hover:border-white/10 transition-colors">
          <h2 className="text-lg font-medium mb-6">Reports & Analytics</h2>
          
          <div className="grid grid-cols-2 gap-4 h-full pb-8">
            <Link href="/admin/reports" className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center min-h-[140px] hover:border-white/20 transition-all cursor-pointer group">
              <Activity className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">User Growth</div>
              <div className="text-xs text-zinc-500 mt-1">View Chart</div>
            </Link>
            <Link href="/admin/reports" className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center min-h-[140px] hover:border-emerald-500/30 transition-all cursor-pointer group">
              <CreditCard className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Sub Revenue</div>
              <div className="text-xs text-zinc-500 mt-1">View Chart</div>
            </Link>
            <Link href="/admin/reports" className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center min-h-[140px] hover:border-amber-500/30 transition-all cursor-pointer group">
              <Trophy className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Prize Distribution</div>
              <div className="text-xs text-zinc-500 mt-1">View Chart</div>
            </Link>
            <Link href="/admin/reports" className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center justify-center min-h-[140px] hover:border-rose-500/30 transition-all cursor-pointer group">
              <Heart className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Charity Stats</div>
              <div className="text-xs text-zinc-500 mt-1">View Chart</div>
            </Link>
          </div>
        </div>
      </div>
      
    </div>
  )
}
