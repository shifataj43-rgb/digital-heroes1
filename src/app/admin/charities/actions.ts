'use server'

import { getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCharity(formData: FormData) {
  const adminSupabase = await getAdminClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const image_url = formData.get('image_url') as string

  if (!name) return { error: 'Name is required' }

  await adminSupabase.from('charities').insert({ name, description, image_url })
  revalidatePath('/admin/charities')
  revalidatePath('/dashboard/charity')
  return { success: true }
}

export async function editCharity(id: string, formData: FormData) {
  const adminSupabase = await getAdminClient()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const image_url = formData.get('image_url') as string

  if (!name) return { error: 'Name is required' }

  await adminSupabase.from('charities').update({ name, description, image_url }).eq('id', id)
  revalidatePath('/admin/charities')
  revalidatePath('/dashboard/charity')
  return { success: true }
}

export async function deleteCharity(id: string) {
  const adminSupabase = await getAdminClient()
  await adminSupabase.from('charities').delete().eq('id', id)
  revalidatePath('/admin/charities')
  revalidatePath('/dashboard/charity')
  return { success: true }
}
