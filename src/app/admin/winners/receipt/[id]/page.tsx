import { getAdminClient } from '@/lib/supabase/server'
import { Trophy, CheckCircle2, Calendar, User, DollarSign } from 'lucide-react'
import Link from 'next/link'
import PrintButton from './PrintButton'

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const adminSupabase = await getAdminClient()
  
  const { data: winner } = await adminSupabase
    .from('winners')
    .select('*, profiles(full_name, id)')
    .eq('id', resolvedParams.id)
    .single()

  if (!winner) {
    return <div className="p-12 text-center text-zinc-400">Receipt not found.</div>
  }

  const exactDate = winner.created_at 
    ? new Date(winner.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : winner.draw_month;

  return (
    <div className="min-h-screen bg-transparent text-zinc-900 p-8 flex items-start justify-center pt-12">
      <div className="max-w-2xl w-full bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:border-none">
        
        {/* Header */}
        <div className="bg-zinc-950 p-8 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Digital Heroes</h1>
              <p className="text-zinc-400 text-sm">Official Payout Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-light text-emerald-400">PAID</div>
            <div className="text-zinc-400 text-sm">#{winner.id.substring(0, 8).toUpperCase()}</div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          
          <div className="flex items-center justify-center py-6 border-b border-zinc-100">
            <div className="text-center">
              <div className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-2">Total Payout Amount</div>
              <div className="text-6xl font-light text-zinc-900 tracking-tight flex items-center justify-center gap-1">
                <DollarSign className="w-10 h-10 text-emerald-500" />
                {Number(winner.prize_amount).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2"><User className="w-4 h-4"/> Recipient</div>
                <div className="font-medium text-lg">{winner.profiles?.full_name || 'Anonymous User'}</div>
                <div className="text-sm text-zinc-500 font-mono mt-1">UID: {winner.profiles?.id ? `UID-${winner.profiles.id.substring(0, 5).toUpperCase()}` : 'Unknown'}</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-zinc-500 font-medium mb-1 flex items-center gap-2"><Calendar className="w-4 h-4"/> Draw Reference</div>
                <div className="font-medium text-lg">{exactDate}</div>
                <div className="text-sm text-zinc-500 mt-1">{winner.match_type} Winner</div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800">
              This digital receipt confirms that the prize amount of <strong>${Number(winner.prize_amount).toFixed(2)}</strong> has been successfully disbursed to the winner following successful handicap verification.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-zinc-50 p-6 text-center text-sm text-zinc-500 border-t border-zinc-200">
          <p>Digital Heroes Support • support@digitalheroes.com</p>
          <div className="mt-4 print:hidden flex justify-center gap-4">
            <PrintButton />
            <Link href="/admin/winners" className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-colors">Back to Admin</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
