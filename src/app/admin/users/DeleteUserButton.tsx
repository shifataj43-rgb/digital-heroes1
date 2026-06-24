'use client'

import { Trash2 } from 'lucide-react'

export default function DeleteUserButton() {
  return (
    <button 
      type="submit" 
      className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors" 
      title="Delete User"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
