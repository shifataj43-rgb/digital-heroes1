import { getAdminClient } from '@/lib/supabase/server'
import { Users, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toggleSubscription, deleteUser } from './actions'
import SearchInput from './SearchInput'
import DeleteUserButton from './DeleteUserButton'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams;
  const adminSupabase = await getAdminClient()
  
  let query = adminSupabase.from('profiles').select('*').order('created_at', { ascending: false })
  
  if (params.q) {
    query = query.ilike('full_name', `%${params.q}%`)
  }
  
  const { data: profiles } = await query

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-400" />
            Manage Users & Subscriptions
          </h1>
          <p className="text-zinc-400 mt-2">View and manage all registered platform users.</p>
        </div>
        <SearchInput />
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden bg-zinc-900/30">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900/80 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium text-zinc-400">User ID</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Name</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Plan</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Role</th>
              <th className="px-6 py-4 font-medium text-zinc-400">Subscription</th>
              <th className="px-6 py-4 font-medium text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {profiles && profiles.length > 0 ? (
              profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-zinc-500 font-mono text-xs">UID-{profile.id.substring(0, 5).toUpperCase()}</td>
                  <td className="px-6 py-4 font-medium">{profile.full_name || 'Anonymous User'}</td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-zinc-300 text-xs font-medium bg-zinc-800 px-2 py-1 rounded-md">
                      {profile.subscription_tier || 'Monthly'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.role === 'admin' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${profile.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {profile.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Link href={`/admin/users/${profile.id}`} className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-lg transition-colors flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit User
                      </Link>
                      <form action={toggleSubscription}>
                        <input type="hidden" name="userId" value={profile.id} />
                        <input type="hidden" name="currentStatus" value={profile.subscription_status} />
                        <button className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium rounded transition-colors">
                          {profile.subscription_status === 'active' ? 'Cancel Sub' : 'Activate Sub'}
                        </button>
                      </form>
                      {profile.role !== 'admin' && (
                        <form action={deleteUser}>
                          <input type="hidden" name="userId" value={profile.id} />
                          <DeleteUserButton />
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 text-zinc-600 mb-3" />
                    <p>No users found matching "{params.q}"</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
