import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const adminSupabase = await getAdminClient()
  
  const { data: charities } = await adminSupabase.from('charities').select('*')
  
  if (charities) {
    for (let i = 0; i < charities.length; i++) {
      let keywords = 'charity'
      const name = charities[i].name.toLowerCase()
      
      if (name.includes('green')) keywords = 'forest,trees'
      else if (name.includes('ocean')) keywords = 'ocean,beach'
      else if (name.includes('sports')) keywords = 'kids,sports'
      else if (name.includes('veterans')) keywords = 'veterans,military'
      else if (name.includes('cancer')) keywords = 'hospital,care'
      else if (name.includes('wildlife')) keywords = 'wildlife,safari'
      else if (name.includes('water')) keywords = 'water,village'
      else if (name.includes('education')) keywords = 'school,students'
      else if (name.includes('animal')) keywords = 'dogs,cats'
      else if (name.includes('disaster')) keywords = 'rescue,aid'

      const newImageUrl = `https://loremflickr.com/800/600/${keywords}?lock=${charities[i].id.charCodeAt(0)}`
      
      await adminSupabase
        .from('charities')
        .update({ image_url: newImageUrl })
        .eq('id', charities[i].id)
    }
  }

  return NextResponse.json({ success: true, count: charities?.length || 0 })
}
