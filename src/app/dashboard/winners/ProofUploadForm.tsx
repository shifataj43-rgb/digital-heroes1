'use client'

import { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react'
import { submitVerificationProof } from './actions'

export default function ProofUploadForm({ winId }: { winId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setFile(selectedFile)
      setError(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!previewUrl) return

    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('id', winId)
    formData.append('proof_image_url', previewUrl) // Sending base64 string

    const res = await submitVerificationProof(formData)
    
    setIsSubmitting(false)
    if (res?.error) {
      setError(res.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-amber-400 mb-1">Action Required: Verify Eligibility</label>
        <p className="text-xs text-zinc-400 mb-4">Please upload a screenshot of your scores from the golf platform to claim this prize.</p>
        
        <div 
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            previewUrl ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/30 bg-black/20'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <div className="w-full max-w-xs mx-auto h-32 relative rounded-lg overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Proof preview" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm text-amber-400 font-medium">Click to change screenshot</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-300">Click to upload screenshot</p>
              <p className="text-xs text-zinc-500">PNG, JPG up to 5MB</p>
            </div>
          )}
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-rose-400">{error}</p>
      )}

      {previewUrl && (
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
          ) : (
            <><UploadCloud className="w-4 h-4" /> Submit Proof</>
          )}
        </button>
      )}
    </form>
  )
}
