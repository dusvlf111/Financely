import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import QuestPage from '@/app/quest/page'
import type { Profile } from '@/lib/context/AuthProvider'

const mockAddGold = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/context/AuthProvider', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
  },
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
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('prompts for login when profile is missing', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      addGold: mockAddGold,
    })

    render(<QuestPage />)

    expect(screen.getByText('로그인이 필요합니다.')).toBeInTheDocument()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('renders quests and allows claiming rewards when eligible', async () => {
    const userId = 'user-1'
    const profile = createProfile()

    const questsResponse = [
      {
        id: 'quest-eligible',
        title: '골드 수집',
        description: '골드를 모아보자',
        type: 'weekly',
        target: 3,
        reward_gold: 150,
        reward_energy: 0,
      },
      {
        id: 'quest-progress',
        title: '아직 진행 중',
        description: '진행 중인 퀘스트',
        type: 'daily',
        target: 5,
        reward_gold: 50,
        reward_energy: 1,
      },
    ]

    const userQuestRows = [
      {
        quest_id: 'quest-eligible',
        progress: 3,
        completed_at: null,
      },
      {
        quest_id: 'quest-progress',
        progress: 2,
        completed_at: null,
      },
    ]

    const upsertResult = {
      progress: 3,
      completed_at: new Date().toISOString(),
    }

    const selectQuests = jest.fn().mockResolvedValue({ data: questsResponse })
    const eqMock = jest.fn().mockResolvedValue({ data: userQuestRows })
    const selectUserQuests = jest.fn().mockReturnValue({ eq: eqMock })
    const singleMock = jest.fn().mockResolvedValue({ data: upsertResult })
    const selectAfterUpsert = jest.fn().mockReturnValue({ single: singleMock })
    const upsertMock = jest.fn().mockReturnValue({ select: selectAfterUpsert })

    mockFrom.mockImplementation((table: string) => {
      if (table === 'quests') {
        return { select: selectQuests }
      }
      if (table === 'user_quests') {
        return {
          select: selectUserQuests,
          upsert: upsertMock,
        }
      }
      throw new Error(`Unexpected table: ${table}`)
    })

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      profile,
      addGold: mockAddGold,
    })

    render(<QuestPage />)

    await waitFor(() => expect(selectQuests).toHaveBeenCalledTimes(1))
    expect(mockFrom).toHaveBeenCalledWith('quests')
    expect(mockFrom).toHaveBeenCalledWith('user_quests')

    expect(await screen.findByText('골드 수집')).toBeInTheDocument()
    expect(screen.getByText('아직 진행 중')).toBeInTheDocument()

    const claimButton = await screen.findByRole('button', { name: '보상 받기' })

    fireEvent.click(claimButton)

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: userId, quest_id: 'quest-eligible' }),
        expect.objectContaining({ onConflict: 'user_id, quest_id' })
      )
    })

    expect(mockAddGold).toHaveBeenCalledWith(150)

    await waitFor(() => expect(screen.getByText('보상 수령 완료')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: '보상 받기' })).not.toBeInTheDocument()
  })
})
