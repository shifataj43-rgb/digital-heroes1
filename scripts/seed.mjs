import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  const charities = [
    { name: 'Global Green', description: 'Planting trees to offset carbon footprints of golf courses worldwide.', image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500&q=80' },
    { name: 'Youth Sports Link', description: 'Providing underprivileged youth with access to sports equipment and mentorship.', image_url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&q=80' },
    { name: 'Ocean Clean Initiative', description: 'Removing plastics from our oceans to preserve marine life for future generations.', image_url: 'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=500&q=80' }
  ]
  const { data, error } = await supabase.from('charities').insert(charities)
  if (error) console.error('Error seeding:', error)
  else console.log('Seeded charities successfully!')
}
seed()
