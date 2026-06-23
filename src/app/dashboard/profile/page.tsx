import { createClient, getAdminClient } from '@/lib/supabase/server'
import { User, Shield, Save } from 'lucide-react'
import { updateProfile } from './actions'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const adminSupabase = await getAdminClient()
  const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <User className="w-8 h-8 text-emerald-400" />
          Profile & Settings
        </h1>
        <p className="text-zinc-400 mt-2">Manage your personal information and account settings.</p>
      </div>

      <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl">
        <form action={updateProfile} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={user.email} 
                disabled
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-zinc-500 cursor-not-allowed focus:outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-xs text-zinc-500 bg-black/40 px-2 py-1 rounded-md">
                <Shield className="w-3 h-3" /> Secure
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Your email address cannot be changed. It is used for secure login.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
            <input 
              type="text" 
              name="full_name"
              defaultValue={profile?.full_name || ''}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-zinc-600 transition-all"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Official Golf Handicap ID (Optional)</label>
            <input 
              type="text" 
              name="golf_handicap_id"
              defaultValue={profile?.golf_handicap_id || ''}
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-zinc-600 transition-all"
              placeholder="e.g. WHS-12345678"
            />
            <p className="text-xs text-zinc-500 mt-2">Used to verify your identity if you win a major monthly draw.</p>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button 
              type="submit"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]"
            >
              <Save className="w-5 h-5" /> Save Changes
            </button>
          </div>
          
        </form>
      </div>
    </div>
  )
}
