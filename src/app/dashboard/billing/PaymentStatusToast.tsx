'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

export default function PaymentStatusToast() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      toast.success("Payment successful! Your subscription is now active.")
      // Clean up the URL
      router.replace('/dashboard/billing')
    }

    if (canceled === 'true') {
      toast.error("Payment was canceled.")
      router.replace('/dashboard/billing')
    }
  }, [searchParams, router])

  return null
}
