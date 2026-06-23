'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const date = formData.get('date') as string
  const score = parseInt(formData.get('score') as string, 10)

  if (score < 1 || score > 45) {
    redirect('/dashboard/scores?error=Score must be between 1 and 45')
  }

  // Insert the new score
  const { error: insertError } = await supabase.from('scores').insert({
    user_id: user.id,
    date,
    score
  })

  if (insertError) {
    console.error("Score Insert Error:", insertError)
    if (insertError.code === '23505') {
      redirect('/dashboard/scores?error=You already have a score entry for this exact date! Please select different dates for each score.')
    }
    redirect('/dashboard/scores?error=Failed to add score.')
  }

  // Enforce the 5-score rolling logic
  const { createClient: createServerClient } = await import('@supabase/supabase-js')
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all scores for the user ordered by date ascending (oldest first)
  const { data: scores } = await adminSupabase
    .from('scores')
    .select('id, date')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (scores && scores.length > 5) {
    // We have more than 5. We need to delete the oldest ones until we only have 5.
    const toDeleteCount = scores.length - 5
    const idsToDelete = scores.slice(0, toDeleteCount).map(s => s.id)
    
    // Bypass RLS for deletion since no DELETE policy was created
    await adminSupabase.from('scores').delete().in('id', idsToDelete)
  }

  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard')
  redirect('/dashboard/scores')
}

export async function deleteScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string

  const { createClient: createServerClient } = await import('@supabase/supabase-js')
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await adminSupabase.from('scores').delete().eq('id', id).eq('user_id', user.id)
  
  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard')
  redirect('/dashboard/scores')
}

export async function editScore(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string
  const date = formData.get('date') as string
  const score = parseInt(formData.get('score') as string, 10)

  if (score < 1 || score > 45) {
    return { error: 'Score must be between 1 and 45' }
  }

  const { createClient: createServerClient } = await import('@supabase/supabase-js')
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await adminSupabase
    .from('scores')
    .update({ date, score })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'You already have a score entry for this date.' }
    }
    return { error: 'Failed to update score.' }
  }

  revalidatePath('/dashboard/scores')
  revalidatePath('/dashboard')
  return { success: true }
}
