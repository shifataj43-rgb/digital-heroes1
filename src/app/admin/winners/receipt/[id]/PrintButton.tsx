'use client'
export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="px-4 py-2 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors">
      Print to PDF
    </button>
  )
}
