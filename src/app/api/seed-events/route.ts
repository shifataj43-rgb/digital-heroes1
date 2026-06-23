import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const adminSupabase = await getAdminClient()
  
  // Get all charities
  const { data: charities } = await adminSupabase.from('charities').select('id, name')
  if (!charities) return NextResponse.json({ error: 'No charities found' })

  // Clear existing events to avoid duplicates if run multiple times
  await adminSupabase.from('charity_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  let eventsAdded = 0;

  for (const c of charities) {
    const eventsToSeed = [
      {
        charity_id: c.id,
        title: `${c.name} Annual Golf Classic`,
        date: 'October 15, 2026',
        location: 'Augusta National',
        type: 'Fundraiser'
      },
      {
        charity_id: c.id,
        title: `Community Outreach & Awareness`,
        date: 'November 2, 2026',
        location: 'Downtown Convention Center',
        type: 'Awareness'
      }
    ];
    
    await adminSupabase.from('charity_events').insert(eventsToSeed);
    eventsAdded += 2;
  }
  
  return NextResponse.json({ success: true, message: `Successfully added ${eventsAdded} events across ${charities.length} charities.` })
}
