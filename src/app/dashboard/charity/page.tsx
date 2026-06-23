import { createClient } from '@/lib/supabase/server'
import { Heart, CheckCircle2 } from 'lucide-react'
import { updateCharity } from './actions'
import DonationButton from './DonationButton'
import DashboardCharityList from './DashboardCharityList'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CharityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { getAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await getAdminClient()

  // Fetch charities
  const { data: charities } = await adminSupabase.from('charities').select('*').order('name')
  
  // Fetch user profile & real-time subscription check
  const { data: profile } = await adminSupabase.from('profiles').select('charity_id, charity_percentage, subscription_status, currency').eq('id', user.id).single()

  const isInactive = profile?.subscription_status !== 'active'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-400" />
          Your Impact
        </h1>
        <p className="text-zinc-400 mt-2">
          Choose a cause you care about. We guarantee a minimum of 10% of your subscription goes directly to them. 
          You can optionally increase this percentage.
        </p>
        {isInactive && (
          <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3">
            <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-rose-400 mb-1">Subscription Inactive</p>
              <p className="text-rose-400/80">You can select a charity now, but your contributions won't be active until you start your subscription.</p>
            </div>
          </div>
        )}
      </div>

      {/* Independent Donation Option (Moved to Top) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900/20 to-zinc-900/50 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h3 className="text-xl font-medium text-emerald-400 mb-1">Independent Donation</h3>
          <p className="text-sm text-zinc-400">Want to make a one-time contribution outside of your subscription? 100% goes directly to your selected charity.</p>
        </div>
        <DonationButton charityName={charities?.find(c => c.id === profile?.charity_id)?.name} allCharities={charities || []} currency={profile?.currency || 'USD'} />
      </div>

      <DashboardCharityList initialCharities={charities || []} profile={profile} />

    </div>
  )
}
