import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import QuestPage from '@/app/quest/page'
import type { Profile } from '@/lib/context/AuthProvider'

jest.mock('@/lib/context/AuthProvider', () => ({
  useAuth: jest.fn(),
}))

const mockUseAuth = jest.requireMock('@/lib/context/AuthProvider').useAuth as jest.Mock

function createProfile(): Profile {
  return {
    id: 'profile-1',
    username: 'tester',
    full_name: 'Quest Tester',
    avatar_url: null,
    gold: 100,
    energy: 10,
    level: 1,
    xp: 0,
    streak: 0,
  }
}

describe('QuestPage UI', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('prompts for login when profile is missing', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
    })

    render(<QuestPage />)

    expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('renders quests fetched from the API and shows key quest details', async () => {
    const userId = 'user-1'
    const profile = createProfile()

    const questsResponse = [
      {
        id: 'quest-eligible',
        title: '골드 수집',
        description: '골드를 모아보자',
        type: 'weekly',
        status: 'active',
        reward: { gold: 150 },
        options: ['A', 'B', 'C', 'D', 'E'],
        progress: {
          status: 'in_progress',
          remainingAttempts: 1,
          startedAt: '2030-01-01T00:00:00Z',
          submittedAt: null,
          isSuccess: false,
        },
        timer: {
          limitSeconds: 60,
          expiresAt: '2030-01-05T12:00:00Z',
          startsAt: '2030-01-01T00:00:00Z',
        },
      },
      {
        id: 'quest-completed',
        title: '완료된 퀘스트',
        description: '이미 완료됨',
        type: 'daily',
        status: 'completed',
        reward: { gold: 50, xp: 20 },
        options: ['A', 'B', 'C', 'D', 'E'],
        progress: {
          status: 'completed',
          remainingAttempts: 0,
          startedAt: '2030-01-02T00:00:00Z',
          submittedAt: '2030-01-02T00:10:00Z',
          isSuccess: true,
        },
        timer: {
          limitSeconds: 90,
          expiresAt: null,
          startsAt: '2030-01-02T00:00:00Z',
        },
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: questsResponse }),
    })

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      profile,
    })

    render(<QuestPage />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/quests', expect.any(Object)))

    expect(await screen.findByText('골드 수집')).toBeInTheDocument()
    expect(screen.getByText('완료된 퀘스트')).toBeInTheDocument()
    expect(screen.getByText('골드 +150')).toBeInTheDocument()
    expect(screen.getByText('골드 +50 · 경험치 +20')).toBeInTheDocument()
    expect(screen.getAllByText(/남은 시도/)).toHaveLength(2)
    expect(screen.getAllByText(/만료/)).not.toHaveLength(0)
    expect(screen.getByText('✓ 완료')).toBeInTheDocument()
  })
})
