import React, { useEffect } from 'react'
import { render, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../src/lib/context/AuthProvider'

type RpcReturn = { data: unknown; error: null | { message: string } }

var mockSupabase: {
  auth: {
    getSession: jest.Mock
    onAuthStateChange: jest.Mock
  }
  rpc: jest.Mock<Promise<RpcReturn>, [string, Record<string, unknown>]>
  from: jest.Mock
}

jest.mock('@/lib/supabase/client', () => {
  mockSupabase = {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    rpc: jest.fn(),
    from: jest.fn(),
  }

  return {
    supabase: mockSupabase,
  }
})

const rpcMock = () => mockSupabase.rpc as jest.Mock<Promise<RpcReturn>, [string, Record<string, unknown>]>
const getSessionMock = () => mockSupabase.auth.getSession as jest.Mock
const onAuthStateChangeMock = () => mockSupabase.auth.onAuthStateChange as jest.Mock
const fromMock = () => mockSupabase.from as jest.Mock

const profileRow = {
  id: 'user-1',
  username: null,
  full_name: null,
  avatar_url: null,
  gold: 0,
  energy: 0,
  level: 1,
  xp: 0,
  streak: 0,
  tutorial_completed: false,
}

function setupProfileQueryMock() {
  const single = jest.fn().mockResolvedValue({ data: profileRow })
  const eq = jest.fn(() => ({ single }))
  const select = jest.fn(() => ({ eq }))
  fromMock().mockImplementation(() => ({ select }))
  return { select, eq, single }
}

function TrackQuestProgressCaller({ questType }: { questType: string }) {
  const { trackQuestProgress, user } = useAuth()

  useEffect(() => {
    if (user && trackQuestProgress) {
      trackQuestProgress(questType)
    }
  }, [questType, trackQuestProgress, user])

  return null
}

describe('trackQuestProgress via AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getSessionMock().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'user-1',
            email: 'user@example.com',
          },
        },
      },
    })

    onAuthStateChangeMock().mockImplementation(() => ({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    }))

    setupProfileQueryMock()
  })

  it('passes user id and quest type to the RPC call', async () => {
    rpcMock().mockResolvedValueOnce({ data: null, error: null })

    render(
      <AuthProvider>
        <TrackQuestProgressCaller questType="solve_problem" />
      </AuthProvider>
    )

    await waitFor(() => expect(rpcMock()).toHaveBeenCalledTimes(1))

    expect(rpcMock()).toHaveBeenCalledWith('update_quest_progress', {
      quest_type: 'solve_problem',
      user_id: 'user-1',
    })
  })

  it('logs and swallows RPC errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    rpcMock().mockResolvedValueOnce({
      data: null,
      error: { message: 'missing required input parameter "user_id"' },
    })

    render(
      <AuthProvider>
        <TrackQuestProgressCaller questType="solve_problem" />
      </AuthProvider>
    )

  await waitFor(() => expect(rpcMock()).toHaveBeenCalledTimes(1))

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error tracking quest progress:',
        expect.objectContaining({ message: expect.stringContaining('user_id') })
      )
    )

    consoleErrorSpy.mockRestore()
  })
})
