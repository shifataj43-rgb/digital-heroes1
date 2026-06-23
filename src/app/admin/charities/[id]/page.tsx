import { getAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart } from 'lucide-react'
import CharityDetailManager from './CharityDetailManager'

export const dynamic = 'force-dynamic'

export default async function AdminCharityDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await getAdminClient()
  
  const { data: charity } = await supabase
    .from('charities')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!charity) {
    notFound()
  }

  // Fetch events for this charity
  // We handle the error gracefully in case the user hasn't created the table yet
  const { data: events, error } = await supabase
    .from('charity_events')
    .select('*')
    .eq('charity_id', params.id)
    .order('created_at', { ascending: true })

  const hasTableError = error && error.code === '42P01' // undefined_table

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/charities" className="p-2 bg-zinc-900 hover:bg-white/10 rounded-full transition-colors border border-white/5">
          <ArrowLeft className="w-5 h-5 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-400" />
            {charity.name}
          </h1>
          <p className="text-zinc-400 mt-2">Manage events and details for this charity.</p>
        </div>
      </div>

      <CharityDetailManager 
        charity={charity} 
        initialEvents={events || []} 
        hasTableError={!!hasTableError}
      />
    </div>
  )
}
