'use server'

import { createClient, getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitVerificationProof(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const id = formData.get('id') as string
  const proof_image_url = formData.get('proof_image_url') as string

  if (!id || !proof_image_url) {
    return { error: 'Missing required fields' }
  }

  const adminSupabase = await getAdminClient()
  
  // Ensure the user only updates their own record, and only if it's pending
  const { error } = await adminSupabase
    .from('winners')
    .update({ proof_image_url })
    .eq('id', id)
    .eq('user_id', user.id)
    .eq('status', 'pending')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/winners')
  revalidatePath('/admin/winners')
  
  return { success: true }
}
