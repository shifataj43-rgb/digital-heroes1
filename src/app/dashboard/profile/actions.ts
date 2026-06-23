'use server'

import { createClient, getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const fullName = formData.get('full_name') as string
  const golfHandicapId = formData.get('golf_handicap_id') as string

  // We use adminClient to bypass RLS for updating profile
  const adminSupabase = await getAdminClient()
  
  const { error } = await adminSupabase
    .from('profiles')
    .update({ 
      full_name: fullName
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    throw new Error(error.message || 'Failed to update profile')
  }

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
}
