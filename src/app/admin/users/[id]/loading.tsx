import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 bg-white/5 rounded-lg"></div>
        <div>
          <div className="h-8 w-48 bg-white/10 rounded mb-2"></div>
          <div className="h-4 w-32 bg-white/5 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/10 h-80 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500/50 animate-spin" />
        </div>
        <div className="p-6 rounded-2xl bg-zinc-900/30 border border-white/10 h-80 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500/50 animate-spin" />
        </div>
      </div>
    </div>
  )
}
