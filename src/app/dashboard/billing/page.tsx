import { createClient, getAdminClient } from '@/lib/supabase/server'
import { CreditCard, ShieldCheck } from 'lucide-react'
import { cancelSubscription } from './actions'
import PlanSelection from './PlanSelection'
import PaymentStatusToast from './PaymentStatusToast'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Using admin client to bypass any missing RLS
  const adminSupabase = await getAdminClient()
  const { data: profile } = await adminSupabase.from('profiles').select('subscription_status, created_at, currency').eq('id', user.id).single()
  const isActive = profile?.subscription_status === 'active'
  const userCurrency = profile?.currency || 'USD'

  // Fetch plans matching user currency, with fallback to hardcoded if DB not yet migrated
  let { data: plans } = await adminSupabase.from('plans').select('*').eq('currency', userCurrency).eq('active', true)
  
  if (!plans || plans.length === 0) {
    const isINR = userCurrency === 'INR'
    plans = [
      { plan_name: 'Monthly Plan', currency: userCurrency, monthly_price: isINR ? 499 : 9.99, yearly_price: 0, type: 'monthly' },
      { plan_name: 'Yearly Plan', currency: userCurrency, monthly_price: 0, yearly_price: isINR ? 4999 : 99.00, type: 'yearly' }
    ]
  }

  // Mocked renewal date (30 days from creation)
  const renewalDate = new Date(profile?.created_at || Date.now())
  renewalDate.setDate(renewalDate.getDate() + 30)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <PaymentStatusToast />
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-emerald-400" />
          Subscription & Billing
        </h1>
        <p className="text-zinc-400 mt-2">
          Manage your membership to participate in draws and support charities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Status Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl h-fit">
          <h2 className="text-xl font-medium mb-6">Current Status</h2>
          
          {isActive ? (
            <div className="flex items-center gap-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <div className="flex-1">
                <div className="font-medium text-emerald-400">Active Subscription</div>
                <div className="text-sm text-emerald-500/80 mb-1">You are eligible for all upcoming draws.</div>
                <div className="text-xs text-emerald-600">Renews on {renewalDate.toLocaleDateString()}</div>
              </div>
              <form action={cancelSubscription}>
                <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium rounded-lg transition-colors">
                  Cancel Plan
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-zinc-800/50 border border-white/5 rounded-xl">
              <div className="w-3 h-3 rounded-full bg-zinc-500" />
              <div>
                <div className="font-medium text-zinc-300">Inactive</div>
                <div className="text-sm text-zinc-500">Subscribe to activate your account.</div>
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <PlanSelection isActive={isActive} currency={userCurrency} plans={plans} />

      </div>
    </div>
  )
}
