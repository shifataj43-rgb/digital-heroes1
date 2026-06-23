import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://khmfjsylxzjtjhvydvha.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobWZqc3lseHpqdGpodnlkdmhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjEyNjkyNSwiZXhwIjoyMDk3NzAyOTI1fQ.4ZLg8N_AezH84IKUo9ghx1SxpYO9vAdpaILo6P1bD7c'

const adminSupabase = createClient(supabaseUrl, supabaseKey)

async function clearDraws() {
  console.log('Clearing old draws and winners...')

  // Delete all records (using neq to a dummy UUID to match all rows)
  const dummyId = '00000000-0000-0000-0000-000000000000'

  await adminSupabase.from('winner_verifications').delete().neq('id', dummyId)
  await adminSupabase.from('winners').delete().neq('id', dummyId)
  await adminSupabase.from('draw_entries').delete().neq('id', dummyId)
  await adminSupabase.from('draws').delete().neq('id', dummyId)
  await adminSupabase.from('prize_pool').delete().neq('id', dummyId)

  console.log('Successfully deleted all old draws, entries, and winners!')
}

clearDraws()
