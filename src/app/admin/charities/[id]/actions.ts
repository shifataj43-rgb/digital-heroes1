'use server'

import { getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addEvent(formData: FormData) {
  const supabase = await getAdminClient()
  
  const event = {
    charity_id: formData.get('charity_id') as string,
    title: formData.get('title') as string,
    date: formData.get('date') as string,
    location: formData.get('location') as string,
    type: formData.get('type') as string,
  }

  await supabase.from('charity_events').insert([event])
  revalidatePath('/admin/charities')
  revalidatePath(`/admin/charities/${event.charity_id}`)
  revalidatePath(`/dashboard/charity/${event.charity_id}`)
}

export async function deleteEvent(id: string) {
  const supabase = await getAdminClient()
  await supabase.from('charity_events').delete().eq('id', id)
  revalidatePath('/admin/charities')
}

export async function editEvent(id: string, formData: FormData) {
  const supabase = await getAdminClient()
  
  const event = {
    title: formData.get('title') as string,
    date: formData.get('date') as string,
    location: formData.get('location') as string,
    type: formData.get('type') as string,
  }

  await supabase.from('charity_events').update(event).eq('id', id)
  revalidatePath('/admin/charities')
  revalidatePath(`/admin/charities/${formData.get('charity_id')}`)
  revalidatePath(`/dashboard/charity/${formData.get('charity_id')}`)
}
