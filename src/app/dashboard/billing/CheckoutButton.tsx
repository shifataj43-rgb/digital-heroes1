'use client'

import { useState } from 'react'

export default function CheckoutButton({ plan, label, className }: { plan: 'monthly' | 'yearly', label: string, className: string }) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleCheckout} 
      disabled={loading} 
      className={className}
    >
      {loading ? 'Processing...' : label}
    </button>
  )
}
