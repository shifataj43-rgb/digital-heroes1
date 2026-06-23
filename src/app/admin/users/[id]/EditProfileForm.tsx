'use client'

import { useState } from 'react'
import { updateUserProfile } from '../actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function EditProfileForm({ profile }: { profile: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    await updateUserProfile(formData)
    
    setIsSubmitting(false)
    toast.success("Profile updated successfully!")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="userId" value={profile.id} />
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Full Name</label>
        <input 
          type="text" 
          name="fullName"
          defaultValue={profile.full_name || ''}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Role</label>
        <select 
          name="role" 
          defaultValue={profile.role}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button 
        disabled={isSubmitting}
        className="w-full mt-4 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-3 transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
        ) : (
          "Save Profile"
        )}
      </button>
    </form>
  )
}
