'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  // Check if user is an admin to redirect them appropriately
  if (data?.user) {
    const { getAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await getAdminClient()
    
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
      
    if (profile?.role === 'admin') {
      revalidatePath('/', 'layout')
      redirect('/admin')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
      }
    }
  }

  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/signup?message=Could not create account')
  }

  // Update Country and Currency in Profile
  const country = formData.get('country') as string || 'United States'
  const currency = country === 'India' ? 'INR' : 'USD'

  if (authData?.user) {
    const { getAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await getAdminClient()
    
    // The Postgres trigger 'on_auth_user_created' runs asynchronously.
    // We add a short delay to ensure the row exists before we try to update it.
    await new Promise(resolve => setTimeout(resolve, 1000))
    await adminSupabase.from('profiles').update({ country, currency }).eq('id', authData.user.id)
  }

  // Log them out immediately so they have to log in manually as requested
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/login?message=Account successfully created! Please log in.')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
