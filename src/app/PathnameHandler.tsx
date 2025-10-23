"use client"

import { usePathname } from 'next/navigation'
import React from 'react'

export default function PathnameHandler({ children }: { children: (pathname: string) => React.ReactNode }) {
  const pathname = usePathname()
  return <>{children(pathname)}</>
}