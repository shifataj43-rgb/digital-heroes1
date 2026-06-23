import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center">
        <XCircle className="w-12 h-12 text-rose-400" />
      </div>
      <div>
        <h1 className="text-4xl font-light mb-4">Checkout Canceled</h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Your subscription process was safely canceled. No charges were made to your test card.
        </p>
      </div>
      <Link href="/dashboard/billing" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all">
        Return to Billing
      </Link>
    </div>
  )
}
