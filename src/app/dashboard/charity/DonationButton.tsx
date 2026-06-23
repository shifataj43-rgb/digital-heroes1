'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { CreditCard, Heart, X, CheckCircle2 } from 'lucide-react'

export default function DonationButton({ charityName, allCharities = [], currency = 'USD' }: { charityName?: string, allCharities?: any[], currency?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCharityName, setSelectedCharityName] = useState(charityName || (allCharities.length > 0 ? allCharities[0].name : ''))
  
  const isINR = currency === 'INR'
  const symbol = isINR ? '₹' : '$'
  const presetAmounts = isINR ? [500, 1000, 2500, 5000] : [10, 25, 50, 100]

  const [amount, setAmount] = useState<number>(presetAmounts[2])
  const [customAmount, setCustomAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
    setIsSuccess(false)
    if (!selectedCharityName && allCharities.length > 0) {
      setSelectedCharityName(allCharities[0].name)
    }
  }

  const handleDonate = async () => {
    setIsProcessing(true)
    
    try {
      const res = await fetch('/api/stripe/donation-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityName: selectedCharityName,
          amount: amount,
          currency: currency
        })
      })
      
      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to initialize payment')
        setIsProcessing(false)
      }
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
      setIsProcessing(false)
    }
  }

  return (
    <>
      <button 
        onClick={handleOpen}
        className="whitespace-nowrap px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
      >
        Make a Donation
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
            
            {/* Header */}
            <div className="bg-zinc-900/50 p-6 border-b border-white/5 flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-xl font-medium flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-400" />
                  Support {selectedCharityName}
                </h2>
                <p className="text-sm text-zinc-400 mt-1">100% of your donation goes directly to the cause.</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors relative z-10">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSuccess ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-medium">Thank You!</h3>
                <p className="text-zinc-400">Your generous donation of <span className="text-emerald-400 font-medium">{symbol}{amount}</span> has been processed successfully.</p>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Charity Selection */}
                {allCharities && allCharities.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-3">Select Charity to Support</label>
                    
                    {/* Display Selected Charity Image */}
                    {selectedCharityName && (
                      <div className="mb-4 h-32 w-full rounded-xl overflow-hidden relative border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={allCharities.find(c => c.name === selectedCharityName)?.image_url || '/images/charity.png'} 
                          alt={selectedCharityName}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                        <div className="absolute bottom-3 left-4 right-4 text-white font-medium text-lg truncate">
                          {selectedCharityName}
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <select 
                        value={selectedCharityName} 
                        onChange={(e) => setSelectedCharityName(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                      >
                        {allCharities.map(c => (
                          <option key={c.id} value={c.name} className="bg-zinc-900">{c.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                        ▼
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount Selection */}
                <div>
                  <label className="text-sm font-medium text-zinc-300 block mb-3">Select Amount</label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {presetAmounts.map(val => (
                      <button 
                        key={val}
                        onClick={() => { setAmount(val); setCustomAmount(''); }}
                        className={`py-3 rounded-xl border font-medium transition-all ${
                          amount === val && !customAmount 
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        {symbol}{val}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">{symbol}</span>
                    <input 
                      type="number" 
                      placeholder="Custom Amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        if (e.target.value) setAmount(parseInt(e.target.value, 10));
                      }}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button 
                  onClick={handleDonate}
                  disabled={isProcessing || !amount || amount <= 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-bold py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 mt-4"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Redirecting to Secure Checkout...</span>
                  ) : (
                    <span>Donate {symbol}{amount || 0} Now</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
