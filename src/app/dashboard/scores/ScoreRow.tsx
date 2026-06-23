'use client'

import { useState } from 'react'
import { Trash2, Edit2, X, Check, Loader2 } from 'lucide-react'
import { editScore, deleteScore } from './actions'
import { toast } from 'sonner'

export default function ScoreRow({ score }: { score: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState({ date: score.date, points: score.score })

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('id', score.id)
    formData.append('date', editData.date)
    formData.append('score', editData.points.toString())

    const res = await editScore(formData)
    setIsSubmitting(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success("Score updated successfully!")
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const formData = new FormData()
    formData.append('id', score.id)
    await deleteScore(formData)
    // No need to reset isDeleting since the row will be unmounted
  }

  if (isEditing) {
    return (
      <form onSubmit={handleEdit} className="p-4 rounded-xl bg-white/10 border border-emerald-500/30 transition-all">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs text-zinc-400">Date Played</label>
            <input 
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              value={editData.date}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            />
          </div>
          <div className="flex-1 w-full space-y-1">
            <label className="text-xs text-zinc-400">Stableford Points (1-45)</label>
            <input 
              type="number"
              min="1"
              max="45"
              required
              value={editData.points}
              onChange={(e) => setEditData({ ...editData, points: parseInt(e.target.value) })}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-5 self-end sm:self-auto w-full sm:w-auto">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 sm:flex-none p-2 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors flex justify-center"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-lg">
          {score.score}
        </div>
        <div>
          <div className="font-medium">Stableford Points</div>
          <div className="text-sm text-zinc-400">{new Date(score.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-2 text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
