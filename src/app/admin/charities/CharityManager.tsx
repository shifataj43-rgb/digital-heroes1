'use client'

import { useState } from 'react'
import { Heart, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { addCharity, editCharity, deleteCharity } from './actions'
import Link from 'next/link'

export default function CharityManager({ initialCharities }: { initialCharities: any[] }) {
  const [charities, setCharities] = useState(initialCharities)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCharity, setEditingCharity] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleOpenModal = (charity: any = null) => {
    setEditingCharity(charity)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingCharity(null)
    setIsModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    if (editingCharity) {
      await editCharity(editingCharity.id, formData)
    } else {
      await addCharity(formData)
    }
    
    // Simulate optimistic UI update or wait for server revalidation
    window.location.reload() 
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this charity? Users subscribing to it will lose their association.')) {
      setLoading(true)
      await deleteCharity(id)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-400" />
            Manage Charity Listings
          </h1>
          <p className="text-zinc-400 mt-2">Add, edit, or remove charities available for user selection.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Charity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {charities?.map((charity) => (
          <div key={charity.id} className="relative group">
            <Link href={`/admin/charities/${charity.id}`} className="block p-6 rounded-2xl bg-zinc-900/50 border border-white/10 transition-all hover:border-emerald-500/50 h-full">
              {charity.image_url ? (
                <div className="w-16 h-16 rounded-xl border border-white/10 mb-4 overflow-hidden bg-white/5 relative flex items-center justify-center">
                  <img 
                    src={charity.image_url} 
                    alt={charity.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        target.nextElementSibling.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="hidden text-2xl font-bold text-rose-300">
                    {charity.name.charAt(0)}
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-4 shadow-sm font-bold text-rose-300">
                  {charity.name.charAt(0)}
                </div>
              )}
              <h3 className="text-lg font-medium group-hover:text-emerald-400 transition-colors">{charity.name}</h3>
              <p className="text-sm text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                {charity.description}
              </p>
            </Link>
            
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <button 
                onClick={(e) => { e.preventDefault(); handleOpenModal(charity); }}
                className="p-2 bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-zinc-400 transition-colors"
                title="Quick Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); handleDelete(charity.id); }}
                className="p-2 bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-zinc-400 transition-colors"
                title="Delete Charity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-md relative shadow-2xl">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-light mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500" />
              {editingCharity ? 'Edit Charity' : 'Add New Charity'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Charity Name</label>
                <input 
                  type="text" 
                  name="name"
                  defaultValue={editingCharity?.name}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white placeholder-zinc-600"
                  placeholder="e.g. Fairways for Cancer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea 
                  name="description"
                  defaultValue={editingCharity?.description}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white placeholder-zinc-600 resize-none"
                  placeholder="Describe the charity's mission..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Media URL (Logo or Banner)</label>
                <input 
                  type="url" 
                  name="image_url"
                  defaultValue={editingCharity?.image_url}
                  className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-white placeholder-zinc-600"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-lg font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCharity ? 'Save Changes' : 'Create Charity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
