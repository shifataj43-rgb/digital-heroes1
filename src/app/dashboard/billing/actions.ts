'use server'

import { createClient, getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function cancelSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Not authenticated")

  // Use admin client to bypass RLS for system-level updates
  const adminSupabase = await getAdminClient()
  const { error } = await adminSupabase.from('profiles').update({
    subscription_status: 'inactive',
    stripe_subscription_id: null
  }).eq('id', user.id)

  if (error) {
    console.error("Cancellation error", error)
    return { error: "Failed to cancel subscription" }
  }

  revalidatePath('/dashboard/billing')
  revalidatePath('/dashboard', 'layout')
  
  return { success: true }
}

