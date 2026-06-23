'use server'

import { getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateVerificationStatus(formData: FormData) {
  const adminSupabase = await getAdminClient()
  
  const id = formData.get('id') as string
  const status = formData.get('status') as string // 'approved', 'rejected', 'paid'
  
  if (!id || !status) {
    return { error: 'Missing required fields' }
  }

  // Ensure the status is valid
  if (!['approved', 'rejected', 'paid'].includes(status)) {
    return { error: 'Invalid status' }
  }

  const { error } = await adminSupabase
    .from('winners')
    .update({ status })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/winners')
  revalidatePath('/admin') // To update dashboard tiles if necessary
  
  return { success: true }
}
