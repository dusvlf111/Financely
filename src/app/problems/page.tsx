"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProblemsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/learn')
  }, [router])

  return null
}
