import { NextResponse } from 'next/server'

export async function POST(_request: Request, _context: { params: { questId: string } }) {
  return NextResponse.json(
    { error: { code: 'NOT_IMPLEMENTED', message: 'Not implemented' } },
    { status: 501 }
  )
}
