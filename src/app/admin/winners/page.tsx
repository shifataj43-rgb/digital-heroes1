import { getAdminClient } from '@/lib/supabase/server'
import { DollarSign, UploadCloud, CheckCircle2, Clock } from 'lucide-react'
import { updateVerificationStatus } from './actions'
import Link from 'next/link'

export default async function AdminPayoutsPage() {
  const adminSupabase = await getAdminClient()
  
  // Fetch real winners from the new explicit winners table
  const { data: winners } = await adminSupabase
    .from('winners')
    .select(`
      *,
      profiles(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-emerald-400" />
          Verify Winners & Payouts
        </h1>
        <p className="text-zinc-400 mt-2">View winners and manage payouts.</p>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden bg-zinc-900/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/80 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium text-zinc-400">Draw Date</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Winner Name</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Match Tier</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Prize Amount</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Status</th>
              <th className="px-6 py-4 font-medium text-zinc-400 text-right">Proof of Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {winners && winners.length > 0 ? (
              winners.map((winner: any) => {
                const exactDate = winner.created_at 
                  ? new Date(winner.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                  : winner.draw_month;
                
                return (
                  <tr key={winner.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-zinc-300">{exactDate}</td>
                    <td className="px-6 py-4 font-medium text-zinc-200">
                      {winner.profiles?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">{winner.match_type}</td>
                    <td className="px-6 py-4 font-medium text-emerald-400">${Number(winner.prize_amount).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {winner.status === 'paid' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : winner.status === 'approved' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : winner.status === 'rejected' ? (
                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-medium bg-rose-500/10 px-2.5 py-1 rounded-full w-fit">
                          Rejected
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium bg-amber-500/10 px-2.5 py-1 rounded-full w-fit">
                          <Clock className="w-3.5 h-3.5" /> Pending Review
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {winner.status === 'paid' ? (
                        <Link href={`/admin/winners/receipt/${winner.id}`} className="text-xs text-zinc-400 hover:text-white underline">
                          View Receipt
                        </Link>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {winner.proof_image_url && (
                            <a href={winner.proof_image_url} download={`proof_${winner.user_id}.png`} className="text-xs text-emerald-400 hover:text-emerald-300 underline mr-4">Download Screenshot</a>
                          )}
                          {winner.status === 'pending' && (
                            <>
                              <form action={updateVerificationStatus}>
                                <input type="hidden" name="id" value={winner.id} />
                                <input type="hidden" name="status" value="approved" />
                                <button type="submit" className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded transition-colors mr-2">
                                  Approve
                                </button>
                              </form>
                              <form action={updateVerificationStatus}>
                                <input type="hidden" name="id" value={winner.id} />
                                <input type="hidden" name="status" value="rejected" />
                                <button type="submit" className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-medium rounded transition-colors">
                                  Reject
                                </button>
                              </form>
                            </>
                          )}
                          {winner.status === 'approved' && (
                            <form action={updateVerificationStatus}>
                              <input type="hidden" name="id" value={winner.id} />
                              <input type="hidden" name="status" value="paid" />
                              <button type="submit" className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium rounded transition-colors">
                                Mark Paid
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No winner verifications found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
