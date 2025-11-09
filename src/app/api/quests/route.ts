import { NextResponse } from 'next/server'

export async function GET(_request: Request) {
  return NextResponse.json(
    { error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented' } },
    { status: 501 }
  )
}
