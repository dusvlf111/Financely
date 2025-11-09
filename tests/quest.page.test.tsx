import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import QuestPage from '@/app/quest/page'
import type { Profile } from '@/lib/context/AuthProvider'

jest.mock('@/lib/context/AuthProvider', () => ({
  useAuth: jest.fn(),
}))

const mockUseAuth = jest.requireMock('@/lib/context/AuthProvider').useAuth as jest.Mock

const originalRequestAnimationFrame = global.requestAnimationFrame
const originalCancelAnimationFrame = global.cancelAnimationFrame

beforeAll(() => {
  global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    callback(0)
    return 0
  }) as typeof global.requestAnimationFrame

  global.cancelAnimationFrame = ((handle: number) => handle) as typeof global.cancelAnimationFrame
})

afterAll(() => {
  global.requestAnimationFrame = originalRequestAnimationFrame
  if (originalCancelAnimationFrame) {
    global.cancelAnimationFrame = originalCancelAnimationFrame
  }
})

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
    window.sessionStorage.clear()
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
      {
        id: 'quest-monthly',
        title: '월간 도전',
        description: '월간 목표 달성',
        type: 'monthly',
        status: 'active',
        reward: { xp: 100 },
        options: ['A', 'B', 'C', 'D', 'E'],
        progress: {
          status: 'idle',
          remainingAttempts: 2,
          startedAt: null,
          submittedAt: null,
          isSuccess: null,
        },
        timer: {
          limitSeconds: 120,
          expiresAt: '2030-02-01T00:00:00Z',
          startsAt: '2030-01-01T00:00:00Z',
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
  expect(screen.getByText('월간 도전')).toBeInTheDocument()
  expect(screen.getByText('월간 퀘스트')).toBeInTheDocument()
    expect(screen.getByText('골드 +150')).toBeInTheDocument()
    expect(screen.getByText('골드 +50 · 경험치 +20')).toBeInTheDocument()
  expect(screen.getAllByText(/남은 시도/)).toHaveLength(3)
    expect(screen.getAllByText(/만료/)).not.toHaveLength(0)
    expect(screen.getByText('✓ 완료')).toBeInTheDocument()
  })

  it('does not flash empty state before quests finish loading', async () => {
    const userId = 'user-loading'
    const profile = createProfile()

    let resolveFetch: ((value: { ok: boolean; json: () => Promise<{ data: unknown[] }> }) => void) | undefined

    ;(global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        })
    )

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      profile,
    })

    const { container } = render(<QuestPage />)

    expect(screen.queryByText('등록된 퀘스트가 없습니다.')).not.toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()

    expect(resolveFetch).toBeDefined()

    resolveFetch?.({
      ok: true,
      json: async () => ({ data: [] }),
    })

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))

    await waitFor(() => expect(screen.getByText('등록된 퀘스트가 없습니다.')).toBeInTheDocument())
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument()
  })

  it('supports event quest interactions and displays rich reward labels', async () => {
    const userId = 'user-2'
    const profile = createProfile()

    const eventQuest = {
      id: 'quest-event',
      title: '깜짝 퀘스트: 옵션 합성 전략',
      description: '다음 중 옵션 합성 전략이 아닌 것은 무엇일까요?',
      type: 'event' as const,
      status: 'active' as const,
      reward: {
        type: 'stock_entry',
        symbol: 'TSLA',
        label: '테슬라 주식 응모권',
        quantity: 1,
        limited: 50,
      },
      options: ['Protective Put', 'Covered Call', 'Straddle', 'Martingale Strategy', 'Butterfly Spread'],
      progress: {
        status: 'idle' as const,
        remainingAttempts: 1,
        startedAt: null,
        submittedAt: null,
        isSuccess: null,
      },
      timer: {
        limitSeconds: 5,
        expiresAt: null,
        startsAt: null,
      },
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [eventQuest] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            questId: eventQuest.id,
            status: 'in_progress',
            attempts: 1,
            startedAt: '2030-03-01T00:00:00Z',
            timeLimitSeconds: 5,
            expiresAt: '2030-03-01T00:00:05Z',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            questId: eventQuest.id,
            status: 'completed',
            isSuccess: true,
            timeTakenSeconds: 3,
            rewardIssued: true,
          },
        }),
      })

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      profile,
    })

    render(<QuestPage />)

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith('/api/quests', expect.any(Object)))

    expect(await screen.findByText('테슬라 주식 응모권 ×1 (선착순 50명)')).toBeInTheDocument()

    const startButton = screen.getByRole('button', { name: '도전하기' })
    fireEvent.click(startButton)

    await waitFor(() =>
      expect(global.fetch).toHaveBeenNthCalledWith(2, `/api/quests/${eventQuest.id}/start`, expect.objectContaining({
        method: 'POST',
      }))
    )

    expect(await screen.findByText('정답을 선택하세요.')).toBeInTheDocument()

    const optionButton = screen.getByRole('button', { name: 'Martingale Strategy' })
    fireEvent.click(optionButton)

    const submitButton = screen.getByRole('button', { name: '답안 제출' })
    fireEvent.click(submitButton)

    await waitFor(() =>
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        `/api/quests/${eventQuest.id}/submit`,
        expect.objectContaining({
          method: 'POST',
        })
      )
    )

    expect(await screen.findByText('정답입니다! 응모권이 지급 대기 상태입니다.')).toBeInTheDocument()
  })

  it('applies mobile-friendly typography classes on quest cards and heading', async () => {
    const userId = 'mobile-user'
    const profile = createProfile()

    const mobileQuest = {
      id: 'quest-mobile',
      title: '모바일 전용 퀘스트',
      description: '작은 화면에서도 보기 좋게 조정되었습니다.',
      type: 'weekly' as const,
      status: 'active' as const,
      reward: { gold: 25 },
      options: ['A', 'B', 'C', 'D', 'E'],
      progress: {
        status: 'idle' as const,
        remainingAttempts: 3,
        startedAt: null,
        submittedAt: null,
        isSuccess: null,
      },
      timer: {
        limitSeconds: 45,
        expiresAt: null,
        startsAt: null,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [mobileQuest] }),
    })

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      profile,
    })

    const { container } = render(<QuestPage />)

    const heading = await screen.findByRole('heading', { name: '퀘스트' })
    expect(heading.className).toContain('text-xl')
    expect(heading.className).toContain('sm:text-2xl')

    const questTitle = await screen.findByText('모바일 전용 퀘스트')
    expect(questTitle.className).toContain('text-base')
    expect(questTitle.className).toContain('sm:text-lg')

    const card = questTitle.closest('[data-testid="quest-card"]')
    expect(card).not.toBeNull()
    expect(card?.className).toContain('p-4')
    expect(card?.className).toContain('sm:p-5')

    expect(container.querySelectorAll('[data-testid="quest-card"]').length).toBe(1)
  })

  it('reveals quest cards with animation after quests finish loading', async () => {
    const userId = 'user-animate'
    const profile = createProfile()

    const animatedQuest = {
      id: 'quest-animated',
      title: '애니메이션 퀘스트',
      description: '로딩 완료 후 등장합니다.',
      type: 'weekly' as const,
      status: 'active' as const,
      reward: { gold: 10 },
      options: ['A', 'B', 'C', 'D', 'E'],
      progress: {
        status: 'idle' as const,
        remainingAttempts: 1,
        startedAt: null,
        submittedAt: null,
        isSuccess: null,
      },
      timer: {
        limitSeconds: 30,
        expiresAt: null,
        startsAt: null,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [animatedQuest] }),
    })

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      profile,
    })

    render(<QuestPage />)

    const card = await screen.findByTestId('quest-card')
    expect(card.getAttribute('data-revealed')).toBe('false')
    await waitFor(() => expect(card.getAttribute('data-revealed')).toBe('true'))
    expect(card.className).toContain('opacity-100')
  })

  it('reuses cached quests on remount to avoid skeleton flicker', async () => {
    const userId = 'user-cache'
    const profile = createProfile()

    const cachedQuest = {
      id: 'quest-cached',
      title: '캐시된 퀘스트',
      description: '재방문 시에도 깜박임 없이 표시됩니다.',
      type: 'weekly' as const,
      status: 'active' as const,
      reward: { gold: 70 },
      options: ['A', 'B', 'C', 'D', 'E'],
      progress: {
        status: 'idle' as const,
        remainingAttempts: 2,
        startedAt: null,
        submittedAt: null,
        isSuccess: null,
      },
      timer: {
        limitSeconds: 45,
        expiresAt: null,
        startsAt: null,
      },
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [cachedQuest] }),
    })

    mockUseAuth.mockReturnValue({
      user: { id: userId },
      profile,
    })

    const { unmount, container } = render(<QuestPage />)

    expect(await screen.findByText('캐시된 퀘스트')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeNull()

    const cachedValue = window.sessionStorage.getItem('financely.questCache.v1')
    expect(cachedValue).not.toBeNull()

    unmount()

    ;(global.fetch as jest.Mock).mockClear()
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    const { container: secondContainer } = render(<QuestPage />)

    expect(screen.getByText('캐시된 퀘스트')).toBeInTheDocument()
    const cachedCard = screen.getByTestId('quest-card')
    expect(cachedCard.className).not.toContain('card-scale-in')
    expect(secondContainer.querySelector('.animate-pulse')).toBeNull()
    expect(global.fetch).toHaveBeenCalledWith('/api/quests', expect.any(Object))
  })
})
