import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const adminSupabase = await getAdminClient()

  const prefixes = ['d6f8b', '60f5f', '503ce', '5b3ce', '23b02', '413c0'] // including lowercase
  
  try {
    // Get all users from profiles
    const { data: profiles, error } = await adminSupabase.from('profiles').select('id')
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const deletedIds = []

    for (const profile of profiles || []) {
      const isTarget = prefixes.some(prefix => profile.id.toLowerCase().startsWith(prefix))
      
      if (isTarget) {
        console.log(`Deleting user: ${profile.id}`)
        
        // Delete related
        await adminSupabase.from('scores').delete().eq('user_id', profile.id)
        await adminSupabase.from('winner_verifications').delete().eq('user_id', profile.id)
        await adminSupabase.from('winners').delete().eq('user_id', profile.id)
        
        // Delete profile
        await adminSupabase.from('profiles').delete().eq('id', profile.id)
        
        // Delete auth user
        await adminSupabase.auth.admin.deleteUser(profile.id)
        
        deletedIds.push(profile.id)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully deleted ${deletedIds.length} users.`,
      deletedIds 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
