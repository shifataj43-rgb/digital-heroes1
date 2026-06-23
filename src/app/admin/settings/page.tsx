import { getAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'
import { Settings, User, Shield, Key } from 'lucide-react'
import { updateProfile } from './actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminSupabase = await getAdminClient()
  const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', user?.id).single()

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-zinc-400" />
          System Settings
        </h1>
        <p className="text-zinc-400 mt-2">Manage your administrator profile and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 bg-white/5 text-white rounded-lg font-medium flex items-center gap-3 border border-white/10">
            <User className="w-4 h-4 text-emerald-400" /> My Profile
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10">
            <h2 className="text-xl font-medium mb-6">Profile Information</h2>
            
            <form action={updateProfile} className="space-y-6">
              <input type="hidden" name="id" value={user?.id} />
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address (Read Only)</label>
                <input 
                  type="email" 
                  disabled
                  defaultValue={user?.email}
                  className="w-full px-4 py-3 bg-black/30 border border-white/5 rounded-lg text-zinc-500 cursor-not-allowed"
                />
                <p className="text-xs text-zinc-500 mt-2">Administrator emails cannot be changed directly for security reasons.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="full_name"
                  defaultValue={profile?.full_name}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-zinc-600"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
