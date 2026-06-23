'use client'

import { useState } from 'react'
import { Heart, ArrowRight, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function CharityList({ initialCharities }: { initialCharities: any[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('All')

  // Mock categories based on keywords in description for demo purposes
  const categories = ['All', 'Health', 'Children', 'Environment', 'Sports']

  const filteredCharities = initialCharities.filter(charity => {
    const matchesSearch = charity.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          charity.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Simple mock filter logic
    if (filter === 'All') return matchesSearch
    return matchesSearch && charity.description.toLowerCase().includes(filter.toLowerCase())
  })

  return (
    <div className="max-w-7xl mx-auto px-6">
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search charities..." 
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCharities.length > 0 ? (
          filteredCharities.map((charity) => (
            <div key={charity.id} className="p-8 rounded-3xl bg-zinc-900/40 border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 group shadow-xl hover:shadow-emerald-900/20 flex flex-col justify-between h-full">
              
              <div>
                {charity.image_url ? (
                  <div className="w-16 h-16 rounded-2xl border border-emerald-500/20 mb-6 overflow-hidden bg-white/5 relative flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                    <img 
                      src={charity.image_url} 
                      alt={charity.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold mb-6 group-hover:scale-110 transition-transform duration-500 text-emerald-400 shadow-inner">
                    {charity.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-2xl font-medium mb-3 group-hover:text-emerald-300 transition-colors">{charity.name}</h3>
                <p className="text-zinc-400 font-light leading-relaxed text-base line-clamp-4 mb-6">
                  {charity.description}
                </p>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <Link href={`/charity/${charity.id}`} className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-sm uppercase tracking-wider">
                  View Profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center">
            <Heart className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-zinc-300">No charities found.</h3>
            <p className="text-zinc-500 mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
