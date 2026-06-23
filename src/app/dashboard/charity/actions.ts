'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateCharity(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const charity_id = formData.get('charity_id') as string
  const charity_percentage = parseInt(formData.get('charity_percentage') as string, 10)

  if (charity_percentage < 10 || charity_percentage > 100) {
    return { error: 'Percentage must be between 10% and 100%' }
  }

  const { getAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await getAdminClient()

  const { error } = await adminSupabase.from('profiles').update({
    charity_id,
    charity_percentage
  }).eq('id', user.id)

  if (error) {
    return { error: 'Failed to update charity preferences' }
  }

  revalidatePath('/dashboard/charity')
  revalidatePath('/dashboard')
  return { success: true }
}
