import { getAdminClient } from '@/lib/supabase/server'
import CharityManager from './CharityManager'

export default async function AdminCharitiesPage() {
  const adminSupabase = await getAdminClient()
  const { data: charities } = await adminSupabase.from('charities').select('*').order('name', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto">
      <CharityManager initialCharities={charities || []} />
    </div>
  )
}
