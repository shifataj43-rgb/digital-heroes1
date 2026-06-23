'use client'

import { useState } from 'react'
import { Calendar, Plus, Trash2, Edit2, Loader2, Heart } from 'lucide-react'
import { addEvent, deleteEvent, editEvent } from './actions'
import { editCharity } from '../actions'

export default function CharityDetailManager({ 
  charity, 
  initialEvents,
  hasTableError 
}: { 
  charity: any, 
  initialEvents: any[],
  hasTableError: boolean
}) {
  const [events, setEvents] = useState(initialEvents)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [savingDetails, setSavingDetails] = useState(false)

  if (hasTableError) {
    return (
      <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <h2 className="text-xl font-medium mb-2">Database Setup Required</h2>
        <p>The <code>charity_events</code> table does not exist yet. Please run the SQL command provided to create it.</p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.append('charity_id', charity.id)
    
    if (editingEvent) {
      await editEvent(editingEvent.id, formData)
    } else {
      await addEvent(formData)
    }
    
    window.location.reload()
  }

  const handleUpdateDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSavingDetails(true)
    const formData = new FormData(e.currentTarget)
    await editCharity(charity.id, formData)
    setSavingDetails(false)
    window.location.reload()
  }

  const handleOpenModal = (event: any = null) => {
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Delete this event?')) {
      setLoading(true)
      await deleteEvent(id)
      window.location.reload()
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Charity Details Management */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
        <h2 className="text-xl font-medium flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-rose-400" />
          Charity Details
        </h2>
        <form onSubmit={handleUpdateDetails} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Charity Name</label>
            <input name="name" defaultValue={charity.name} required className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Detailed Description</label>
            <textarea name="description" defaultValue={charity.description} rows={5} required className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Image URL</label>
            <input name="image_url" defaultValue={charity.image_url} className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingDetails} className="px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
              {savingDetails && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Details
            </button>
          </div>
        </form>
      </div>

      {/* Upcoming Events Management */}
      <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Upcoming Events
          </h2>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-zinc-500">No upcoming events. Add one to show on the public charity profile!</p>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-emerald-300">{event.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{event.date} • {event.location} • <span className="text-zinc-500">{event.type}</span></p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleOpenModal(event)}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-medium mb-6">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Event Title</label>
                <input name="title" defaultValue={editingEvent?.title} required className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" placeholder="e.g. Annual Gala" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
                <input name="date" defaultValue={editingEvent?.date} required className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" placeholder="e.g. August 15, 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Location</label>
                <input name="location" defaultValue={editingEvent?.location} required className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" placeholder="e.g. Downtown Center" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Type</label>
                <input name="type" defaultValue={editingEvent?.type} required className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white" placeholder="e.g. Fundraiser" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
