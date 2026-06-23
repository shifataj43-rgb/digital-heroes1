'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function PlanSelection({ isActive, currency, plans }: { isActive: boolean, currency: string, plans: any[] }) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)

  const isINR = currency === 'INR'
  const symbol = isINR ? '₹' : '$'
  
  const monthlyPlan = plans.find(p => p.type === 'monthly' || p.plan_name === 'Monthly Plan')
  const yearlyPlan = plans.find(p => p.type === 'yearly' || p.plan_name === 'Yearly Plan')
  
  const monthlyPrice = monthlyPlan ? monthlyPlan.monthly_price : (isINR ? 499 : 9.99)
  const yearlyPrice = yearlyPlan ? yearlyPlan.yearly_price : (isINR ? 4999 : 99)
  const yearlySavings = (monthlyPrice * 12) - yearlyPrice

  const handleSubscribe = async () => {
    setIsProcessing(true)
    const amount = selectedPlan === 'monthly' ? monthlyPrice : yearlyPrice
    
    try {
      const response = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan,
          amount,
          currency,
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe Checkout using the standard window redirect
        window.location.href = data.url
      } else {
        toast.error(data.error || "Failed to create checkout session.")
        setIsProcessing(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment.")
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Monthly Plan */}
      <div 
        onClick={() => !isActive && setSelectedPlan('monthly')}
        className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          selectedPlan === 'monthly' 
            ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
        }`}
      >
        {selectedPlan === 'monthly' && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            SELECTED
          </div>
        )}
        <h3 className="text-2xl font-medium mb-2">Monthly Plan</h3>
        <div className="text-3xl font-light mb-4">{symbol}{monthlyPrice} <span className="text-lg text-zinc-500">/mo</span></div>
        <ul className="space-y-2 mb-6 text-zinc-400 text-sm">
          <li>✓ Entry into monthly prize draws</li>
          <li>✓ 10% Minimum Charity Contribution</li>
          <li>✓ Cancel anytime</li>
        </ul>
        {isActive ? (
          <button disabled className="w-full bg-zinc-800 text-zinc-500 font-medium py-3 rounded-lg transition-colors">
            Current Plan
          </button>
        ) : (
          <button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className={`w-full font-medium py-3 rounded-lg transition-colors ${
              selectedPlan === 'monthly' ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-white/10 text-white'
            }`} 
          >
            {isProcessing && selectedPlan === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
          </button>
        )}
      </div>
      
      {/* Yearly Plan */}
      <div 
        onClick={() => !isActive && setSelectedPlan('yearly')}
        className={`p-6 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
          selectedPlan === 'yearly' 
            ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
            : 'border-white/10 bg-zinc-900/50 hover:border-white/20'
        }`}
      >
        {selectedPlan === 'yearly' && (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            SELECTED
          </div>
        )}
        <h3 className="text-2xl font-medium mb-2">Yearly Plan</h3>
        <div className="text-3xl font-light mb-4">{symbol}{yearlyPrice} <span className="text-lg text-zinc-500">/yr</span></div>
        <p className="text-sm text-emerald-400 mb-4 font-medium">Save {symbol}{isINR ? yearlySavings : yearlySavings.toFixed(2)} compared to monthly</p>
        <ul className="space-y-2 mb-6 text-zinc-400 text-sm">
          <li>✓ Entry into ALL prize draws for 12 months</li>
          <li>✓ 2 Months FREE</li>
          <li>✓ Cancel anytime</li>
        </ul>
        {isActive ? (
          <button disabled className="w-full bg-zinc-800 text-zinc-500 font-medium py-3 rounded-lg transition-colors">
            Switch to Yearly
          </button>
        ) : (
          <button 
            onClick={handleSubscribe}
            disabled={isProcessing}
            className={`w-full font-medium py-3 rounded-lg transition-colors ${
              selectedPlan === 'yearly' ? 'bg-emerald-500 hover:bg-emerald-400 text-white' : 'bg-white/10 text-white'
            }`} 
          >
            {isProcessing && selectedPlan === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
          </button>
        )}
      </div>
    </div>
  )
}
