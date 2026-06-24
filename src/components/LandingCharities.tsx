'use client'

import { useState } from 'react'
import { Search, Filter, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LandingCharities({ charities }: { charities: any[] }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('All')

  // Mock categories based on keywords in description
  const categories = ['All', 'Health', 'Children', 'Environment', 'Sports']
  
  const categoryKeywords: Record<string, string[]> = {
    'Health': ['health', 'medical', 'cancer', 'disease', 'care', 'therapeutic', 'relief'],
    'Children': ['youth', 'children', 'schools', 'education', 'kids', 'scholarship'],
    'Environment': ['green', 'carbon', 'trees', 'ocean', 'plastic', 'marine', 'wildlife', 'nature', 'water', 'habitat', 'animal'],
    'Sports': ['sports', 'golf', 'athletic', 'tournament', 'fairway']
  }

  const filteredCharities = charities.filter(charity => {
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

  if (!isOpen) {
    return (
      <div className="flex justify-center mt-12">
        <button 
          onClick={() => setIsOpen(true)}
          className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all flex items-center gap-2 hover:-translate-y-1"
        >
          <Heart className="w-5 h-5" />
          View Supported Charities
        </button>
      </div>
    )
  }

  return (
    <div className="mt-12 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search causes..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
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
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCharities.map(charity => (
          <div 
            key={charity.id} 
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 hover:border-emerald-500/30 transition-all duration-300 group shadow-xl hover:shadow-emerald-900/20 flex flex-col"
          >
            <div className="h-48 bg-zinc-800 relative overflow-hidden">
              {charity.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={charity.image_url} 
                  alt={charity.name} 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
            </div>
            
            <div className="p-6 relative flex-1 flex flex-col">
              <h3 className="text-xl font-medium mb-2 group-hover:text-emerald-300 transition-colors">{charity.name}</h3>
              <p className="text-sm text-zinc-400 mb-6 flex-1">{charity.description}</p>
              
              <button 
                onClick={() => router.push(`/signup?charity=${charity.id}`)}
                className="w-full bg-white/10 hover:bg-emerald-500 text-white hover:text-zinc-950 font-medium py-3 rounded-xl transition-colors shadow-sm mt-auto border border-white/5 hover:border-transparent"
              >
                Select Cause & Donate
              </button>
            </div>
          </div>
        ))}
        {filteredCharities.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
            <p className="text-zinc-500 text-lg">No charities found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
