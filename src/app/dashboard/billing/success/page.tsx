import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-emerald-400" />
      </div>
      <div>
        <h1 className="text-4xl font-light mb-4">Payment Successful!</h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Your test subscription is now active. The Stripe webhook should trigger shortly to update your account status.
        </p>
      </div>
      <Link href="/dashboard" className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium rounded-xl transition-all">
        Return to Dashboard
      </Link>
    </div>
  )
}
