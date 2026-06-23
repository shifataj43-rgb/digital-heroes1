import { getAdminClient } from '@/lib/supabase/server'
import { ArrowLeft, User as UserIcon, Trophy } from 'lucide-react'
import Link from 'next/link'
import AdminScoreRow from './AdminScoreRow'
import EditProfileForm from './EditProfileForm'

export default async function UserDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const adminSupabase = await getAdminClient()

  const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', params.id).single()
  const { data: scores } = await adminSupabase.from('scores').select('*').eq('user_id', params.id).order('date', { ascending: false })

  if (!profile) {
    return <div>User not found.</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-light tracking-tight">Edit User</h1>
          <p className="text-zinc-400 mt-1">ID: UID-{profile.id.substring(0, 5).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Edit Profile Form */}
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/10">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-indigo-400" /> Profile Details
          </h2>
          <EditProfileForm profile={profile} />
        </div>

        {/* Edit Scores Form */}
        <div id="scores" className="p-6 rounded-2xl bg-zinc-900/30 border border-white/10">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" /> Score Management
          </h2>
          {scores && scores.length > 0 ? (
            <div className="space-y-3">
              {scores.map((score) => (
                <AdminScoreRow key={score.id} score={score} userId={profile.id} />
              ))}
            </div>
          ) : (
            <div className="text-sm text-zinc-500 italic">No scores submitted yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
