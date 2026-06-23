'use client'

import { useState } from 'react'
import { CheckCircle2, Search, Filter } from 'lucide-react'
import { updateCharity } from './actions'
import { toast } from 'sonner'

export default function DashboardCharityList({ 
  initialCharities, 
  profile 
}: { 
  initialCharities: any[],
  profile: any 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('All')
  const [percentage, setPercentage] = useState(profile?.charity_percentage || 10)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async (formData: FormData) => {
    setIsSubmitting(true)
    const newPercentage = parseInt(formData.get('charity_percentage') as string, 10)
    const res = await updateCharity(formData)
    setIsSubmitting(false)
    if (res?.error) {
      toast.error(res.error)
    } else {
      setPercentage(newPercentage)
      toast.success("Charity Preferences Updated Successfully!")
    }
  }

  // Mock categories based on keywords in description
  const categories = ['All', 'Health', 'Children', 'Environment', 'Sports']
  
  const categoryKeywords: Record<string, string[]> = {
    'Health': ['health', 'medical', 'cancer', 'disease', 'care', 'therapeutic', 'relief'],
    'Children': ['youth', 'children', 'schools', 'education', 'kids', 'scholarship'],
    'Environment': ['green', 'carbon', 'trees', 'ocean', 'plastic', 'marine', 'wildlife', 'nature', 'water', 'habitat', 'animal'],
    'Sports': ['sports', 'golf', 'athletic', 'tournament', 'fairway']
  }

  const filteredCharities = initialCharities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          charity.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filter === 'All') return matchesSearch
    
    const keywords = categoryKeywords[filter] || [filter.toLowerCase()]
    const matchesFilter = keywords.some(kw => 
      charity.name.toLowerCase().includes(kw) || 
      charity.description.toLowerCase().includes(kw)
    )
    
    return matchesSearch && matchesFilter
  })

  // Removed sorting logic per user request so selected charity stays in its original position

  return (
    <div>
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search causes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter className="w-5 h-5 text-zinc-500 hidden md:block mr-2" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCharities.map(charity => {
          const isSelected = profile?.charity_id === charity.id

          return (
            <div 
              key={charity.id} 
              className={`relative overflow-hidden rounded-2xl border transition-all ${
                isSelected ? 'border-rose-500 bg-rose-500/5' : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
              }`}
            >
              <div className="h-48 bg-zinc-800 relative">
                {charity.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={charity.image_url} alt={charity.name} className="w-full h-full object-cover opacity-60" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                {isSelected && (
                  <div className="absolute top-4 right-4 bg-rose-500 text-white p-1 rounded-full shadow-lg">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                )}
              </div>
              
              <div className="p-6 relative">
                <h3 className="text-xl font-medium mb-2">{charity.name}</h3>
                <p className="text-sm text-zinc-400 mb-6">{charity.description}</p>
                
                {isSelected ? (
                  <form action={handleUpdate} className="space-y-4">
                    <input type="hidden" name="charity_id" value={charity.id} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex justify-between">
                        Contribution Percentage
                        <span className="text-rose-400">{percentage}%</span>
                      </label>
                      <input 
                        type="range" 
                        name="charity_percentage" 
                        min="10" 
                        max="100" 
                        value={percentage}
                        onChange={(e) => setPercentage(parseInt(e.target.value))}
                        className="w-full accent-rose-500"
                      />
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>10% (Min)</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <button 
                      disabled={isSubmitting}
                      className="w-full bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Contribution'}
                    </button>
                  </form>
                ) : (
                  <form action={handleUpdate}>
                    <input type="hidden" name="charity_id" value={charity.id} />
                    <input type="hidden" name="charity_percentage" value={10} />
                    <button 
                      disabled={isSubmitting}
                      className="w-full bg-white text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isSubmitting ? 'Selecting...' : 'Select Cause'}
                    </button>
                  </form>
                )}
                
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-center">
                  <a href={`/dashboard/charity/${charity.id}`} className="text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors">
                    View Full Profile & Events &rarr;
                  </a>
                </div>
              </div>
            </div>
          )
        })}
        {filteredCharities.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-zinc-500">No charities found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
