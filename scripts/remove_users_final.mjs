import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const adminSupabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  console.log('Starting user deletion script...')
  
  // Get all users except admin
  const { data: profiles, error } = await adminSupabase.from('profiles').select('id, full_name, role').neq('role', 'admin')
  
  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }

  console.log(`Found ${profiles.length} users to delete.`)

  for (const profile of profiles) {
    console.log(`\nDeleting data for user: ${profile.full_name} (${profile.id})`)
    
    // Delete scores
    const res1 = await adminSupabase.from('scores').delete().eq('user_id', profile.id)
    if (res1.error) console.error('  -> Error deleting scores:', res1.error.message)
    else console.log('  -> Deleted scores')

    // Delete winner verifications
    const res2 = await adminSupabase.from('winner_verifications').delete().eq('user_id', profile.id)
    if (res2.error) console.error('  -> Error deleting winner verifications:', res2.error.message)
    else console.log('  -> Deleted verifications')

    // Delete winners
    const res3 = await adminSupabase.from('winners').delete().eq('user_id', profile.id)
    if (res3.error) console.error('  -> Error deleting winners:', res3.error.message)
    else console.log('  -> Deleted winners')

    // Delete draw entries
    const res4 = await adminSupabase.from('draw_entries').delete().eq('user_id', profile.id)
    if (res4.error) console.error('  -> Error deleting draw entries:', res4.error.message)
    else console.log('  -> Deleted draw entries')

    // Delete subscriptions
    const res_sub = await adminSupabase.from('subscriptions').delete().eq('user_id', profile.id)
    if (res_sub.error) console.error('  -> Error deleting subscriptions:', res_sub.error.message)
    else console.log('  -> Deleted subscriptions')

    // Delete profile
    const res5 = await adminSupabase.from('profiles').delete().eq('id', profile.id)
    if (res5.error) console.error('  -> Error deleting profile:', res5.error.message)
    else console.log('  -> Deleted profile')

    // Delete auth user
    const res6 = await adminSupabase.auth.admin.deleteUser(profile.id)
    if (res6.error) console.error('  -> Error deleting Auth User:', res6.error.message)
    else console.log('  -> Deleted Auth User completely')
  }

  console.log('\nFinished deletion process.')
}

main()
