import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const adminSupabase = await getAdminClient()

  const d = new Date()
  const currentMonthNum = d.getMonth() + 1
  const currentYearNum = d.getFullYear()
  const currentMonthStr = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`

  try {
    // Find the draw ID for the current month
    const { data: existingDraw } = await adminSupabase
      .from('draws')
      .select('id')
      .eq('month', currentMonthNum)
      .eq('year', currentYearNum)
      .maybeSingle()

    if (existingDraw) {
      // 1. Delete winner verifications associated with the draw entries
      const { data: entries } = await adminSupabase.from('draw_entries').select('id').eq('draw_id', existingDraw.id)
      if (entries && entries.length > 0) {
        const entryIds = entries.map(e => e.id)
        await adminSupabase.from('winner_verifications').delete().in('draw_entry_id', entryIds)
      }

      // 2. Delete draw entries
      await adminSupabase.from('draw_entries').delete().eq('draw_id', existingDraw.id)

      // 3. Delete the master draw record
      await adminSupabase.from('draws').delete().eq('id', existingDraw.id)
    }

    // 4. Delete from winners table for the current month string
    await adminSupabase.from('winners').delete().eq('draw_month', currentMonthStr)

    // 5. Delete from prize_pool table for the current month string
    await adminSupabase.from('prize_pool').delete().eq('month', currentMonthStr)

    return NextResponse.json({ 
      success: true, 
      message: `Successfully reset the draw for ${currentMonthStr}. The green completed line should now be gone!`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
