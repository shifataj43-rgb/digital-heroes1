import { getAdminClient } from '@/lib/supabase/server'
import { Heart, Globe, ArrowLeft, Calendar, Users, Target } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CharityProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await getAdminClient()
  
  const { data: charity } = await supabase
    .from('charities')
    .select('*')
    .eq('id', params.id)
    .single()
    
  if (!charity) {
    notFound()
  }

  // Mocking upcoming events since it's not in the DB schema yet
  const events = [
    { id: 1, title: 'Annual Charity Golf Day', date: 'August 15, 2026', location: 'Pristine Fairways Club', type: 'Fundraiser' },
    { id: 2, title: 'Community Outreach Gala', date: 'September 10, 2026', location: 'Downtown Convention Center', type: 'Awareness' },
    { id: 3, title: 'Junior Golf Clinic', date: 'October 5, 2026', location: 'Municipal Links', type: 'Community' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 pb-20">
      
      {/* Navigation Bar */}
      <nav className="w-full z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-medium tracking-tight text-xl">Digital Heroes</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/charity" className="text-sm font-medium text-zinc-300 hover:text-white flex items-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Directory
            </Link>
            <Link href="/signup" className="text-sm font-medium px-5 py-2.5 bg-amber-400 text-zinc-950 rounded-full hover:bg-amber-300 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              Join to Support
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="relative h-96 w-full bg-zinc-900 border-b border-white/10 overflow-hidden">
        {charity.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-zinc-900 to-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full">
          <div className="max-w-5xl mx-auto px-6 pb-12 flex flex-col md:flex-row items-end gap-8">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-3xl bg-zinc-900 border-4 border-zinc-950 shadow-2xl flex items-center justify-center overflow-hidden relative z-10">
              {charity.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={charity.image_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-bold text-emerald-400">{charity.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">{charity.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-emerald-400">
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
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-6 pt-12 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Main Column */}
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-medium mb-4 flex items-center gap-2">
              About the Cause
            </h2>
            <p className="text-zinc-300 text-lg leading-relaxed font-light">
              {charity.description}
            </p>
            {/* Added extra mock text to make the profile look fuller */}
            <p className="text-zinc-400 text-md leading-relaxed font-light mt-4">
              By supporting {charity.name} through Digital Heroes, your monthly subscription contribution goes directly towards funding vital resources, awareness campaigns, and on-the-ground support operations. Every single swing you log in our platform translates directly into real-world impact for those who need it most.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-400" />
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
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/20 to-zinc-900 border border-emerald-500/20 text-center">
            <Heart className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Support {charity.name}</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Join Digital Heroes and pledge a portion of your monthly subscription directly to this cause.
            </p>
            <Link href="/signup" className="block w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              Join Now
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
            <h3 className="font-medium mb-4 flex items-center gap-2 text-zinc-300">
              <Users className="w-5 h-5 text-zinc-500" /> Community Impact
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-light text-emerald-400">142</div>
                <div className="text-sm text-zinc-500">Active Subscribers Supporting</div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="text-2xl font-light text-emerald-400">$2,450</div>
                <div className="text-sm text-zinc-500">Raised This Month</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
