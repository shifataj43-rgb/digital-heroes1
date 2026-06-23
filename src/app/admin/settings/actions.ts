'use server'

import { getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const adminSupabase = await getAdminClient()
  
  const id = formData.get('id') as string
  const full_name = formData.get('full_name') as string

  if (!id || !full_name) {
    return { error: 'Missing required fields' }
  }

  const { error } = await adminSupabase
    .from('profiles')
    .update({ full_name })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  // Revalidate layout and settings page so the new name appears everywhere
  revalidatePath('/', 'layout')
  
  return { success: true }
}
