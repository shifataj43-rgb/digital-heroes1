'use server'

import { getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSubscription(formData: FormData) {
  const userId = formData.get('userId') as string
  const currentStatus = formData.get('currentStatus') as string
  
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

  const adminSupabase = await getAdminClient()
  await adminSupabase.from('profiles').update({ subscription_status: newStatus }).eq('id', userId)

  revalidatePath('/admin/users')
}

export async function updateUserProfile(formData: FormData) {
  const userId = formData.get('userId') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  const adminSupabase = await getAdminClient()
  await adminSupabase.from('profiles').update({ 
    full_name: fullName,
    role: role 
  }).eq('id', userId)

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
}

export async function adminDeleteScore(formData: FormData) {
  const scoreId = formData.get('scoreId') as string
  const userId = formData.get('userId') as string

  const adminSupabase = await getAdminClient()
  await adminSupabase.from('scores').delete().eq('id', scoreId)

  revalidatePath(`/admin/users/${userId}`)
}

export async function adminEditScore(formData: FormData) {
  const scoreId = formData.get('id') as string
  const userId = formData.get('userId') as string
  const date = formData.get('date') as string
  const score = parseInt(formData.get('score') as string)

  if (isNaN(score) || score < 1 || score > 45) {
    return { error: 'Invalid score' }
  }

  const adminSupabase = await getAdminClient()
  await adminSupabase.from('scores').update({ 
    score,
    date
  }).eq('id', scoreId)

  revalidatePath(`/admin/users/${userId}`)
  return { success: true }
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('userId') as string
  const adminSupabase = await getAdminClient()

  try {
    // Delete related records first to avoid foreign key constraint violations
    await adminSupabase.from('scores').delete().eq('user_id', userId)
    await adminSupabase.from('winner_verifications').delete().eq('user_id', userId)
    await adminSupabase.from('winners').delete().eq('user_id', userId)
    
    // Then delete the profile
    await adminSupabase.from('profiles').delete().eq('id', userId)

    // Finally delete from auth.users
    await adminSupabase.auth.admin.deleteUser(userId)
  } catch (error) {
    console.error("Error deleting user:", error)
  }

  revalidatePath('/admin/users')
}
