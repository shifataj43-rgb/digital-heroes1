import { getAdminClient } from '@/lib/supabase/server'
import { Heart, ArrowLeft, Calendar, Users, Target } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardCharityProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await getAdminClient()
  
  const { data: charity } = await supabase
    .from('charities')
    .select('*')
    .eq('id', params.id)
    .single()
    
  const { data: { user } } = await supabase.auth.getUser()
  let userCurrency = 'USD'
  if (user) {
    const { data: viewerProfile } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
    if (viewerProfile?.currency) userCurrency = viewerProfile.currency
  }

  if (!charity) {
    notFound()
  }

  // Real charity stats
  const { data: supporters } = await supabase
    .from('profiles')
    .select('subscription_tier, currency')
    .eq('subscription_status', 'active')
    .eq('charity_id', params.id)
    
  const numSupporters = supporters?.length || 0
  
  let raisedUSD = 0
  let raisedINR = 0
  
  supporters?.forEach(p => {
    const cur = p.currency || 'USD'
    const amt = p.subscription_tier === 'yearly' ? (cur === 'INR' ? 4999/12 : 99/12) : (cur === 'INR' ? 499 : 9.99)
    if (cur === 'USD') raisedUSD += amt * 0.10
    if (cur === 'INR') raisedINR += amt * 0.10
  })

  // Fetch real events from the database
  const { data: dbEvents, error } = await supabase
    .from('charity_events')
    .select('*')
    .eq('charity_id', params.id)
    .order('created_at', { ascending: true })

  // Gracefully fallback to an empty array if the table doesn't exist yet
  const events = error && error.code === '42P01' ? [] : (dbEvents || [])

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Top Bar */}
      <div className="mb-6 flex items-center">
        <Link href="/dashboard/charity" className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Charity Directory
        </Link>
      </div>

      {/* Profile Header */}
      <div className="relative h-72 md:h-80 w-full bg-zinc-900 border border-white/10 overflow-hidden rounded-3xl mb-12">
        {charity.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-zinc-900 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full px-8 pb-8 flex flex-col md:flex-row items-end gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl bg-zinc-900 border-4 border-zinc-950 shadow-2xl flex items-center justify-center overflow-hidden relative z-10">
            {charity.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={charity.image_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-emerald-400">{charity.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 pb-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">{charity.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-medium text-emerald-400">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Target className="w-4 h-4" /> Verified Partner
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <Heart className="w-4 h-4" /> 100% Impact Guarantee
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-zinc-900/40 border border-white/5 p-8 rounded-3xl">
            <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
              About the Cause
            </h2>
            <p className="text-zinc-300 text-lg leading-relaxed font-light whitespace-pre-wrap">
              {charity.description}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Upcoming Events
            </h2>
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg text-emerald-300">{event.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{event.date} • {event.location}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-white/5 rounded-full self-start sm:self-auto border border-white/10">
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-zinc-300">
              <Users className="w-5 h-5 text-zinc-500" /> Community Impact
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-light text-emerald-400">{numSupporters}</div>
                <div className="text-sm text-zinc-500">Active Subscribers Supporting</div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  {userCurrency === 'INR' ? (
                    <>
                      <div className="text-2xl font-light text-emerald-400">₹{raisedINR.toFixed(2)}</div>
                      {raisedUSD > 0 && <div className="text-sm font-medium text-emerald-500/70">${raisedUSD.toFixed(2)}</div>}
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-light text-emerald-400">${raisedUSD.toFixed(2)}</div>
                      {raisedINR > 0 && <div className="text-sm font-medium text-emerald-500/70">₹{raisedINR.toFixed(2)}</div>}
                    </>
                  )}
                </div>
                <div className="text-sm text-zinc-500 mt-2">Raised This Month</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
