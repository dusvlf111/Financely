import { supabase } from '@/lib/supabase/client'
import type { 
  Quest, 
  QuestSubmitResponse
} from '@/lib/types/quest'

/**
 * Fetch all quests with user progress
 */
export async function fetchQuestsWithProgress(userId: string) {
  try {
    // Fetch all active quests
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (questsError) throw questsError

    // Fetch user attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('user_quest_attempts')
      .select('*')
      .eq('user_id', userId)

    if (attemptsError) throw attemptsError

    // Fetch user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_quest_progress')
      .select('*')
      .eq('user_id', userId)

    if (progressError) throw progressError

    // Fetch participants count for event quests
    const eventQuestIds = quests?.filter(q => q.type === 'event').map(q => q.id) || []
    let participantsCounts: Record<string, number> = {}
    
    if (eventQuestIds.length > 0) {
      const { data: participants, error: participantsError } = await supabase
        .from('quest_participants')
        .select('quest_id')
        .in('quest_id', eventQuestIds)

      if (!participantsError && participants) {
        participantsCounts = participants.reduce((acc, p) => {
          acc[p.quest_id] = (acc[p.quest_id] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      }
    }

    // Combine data
    const questsWithProgress = quests?.map(quest => {
      const attempt = attempts?.find(a => a.quest_id === quest.id)
      const prog = progress?.find(p => p.quest_id === quest.id)

      return {
        ...quest,
        user_attempt: attempt,
        user_progress: prog?.progress || 0,
        user_completed_at: prog?.completed_at,
        participants_count: participantsCounts[quest.id] || 0,
        remaining_participants: quest.max_participants 
          ? quest.max_participants - (participantsCounts[quest.id] || 0)
          : null
      }
    })

    return questsWithProgress || []
  } catch (error) {
    console.error('Error fetching quests:', error)
    return []
  }
}

/**
 * Start a quest challenge
 */
export async function startQuestChallenge(userId: string, questId: string): Promise<boolean> {
  try {
    // Check if user has already attempted this quest
    const { data: existingAttempt } = await supabase
      .from('user_quest_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_id', questId)
      .single()

    if (existingAttempt) {
      console.error('Quest already attempted')
      return false
    }

    // Get quest details
    const { data: quest } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single()

    if (!quest) {
      console.error('Quest not found')
      return false
    }

    // For event quests, check participant limit
    if (quest.type === 'event' && quest.max_participants) {
      const { count } = await supabase
        .from('quest_participants')
        .select('*', { count: 'exact', head: true })
        .eq('quest_id', questId)

      if (count && count >= quest.max_participants) {
        console.error('Event quest is full')
        return false
      }

      // Add user to participants
      await supabase
        .from('quest_participants')
        .insert({ quest_id: questId, user_id: userId })
    }

    // For premium quests, check monthly attempt limit
    if (quest.is_premium_only) {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      const { data: monthlyAttempts } = await supabase
        .from('premium_quest_attempts_monthly')
        .select('*')
        .eq('user_id', userId)
        .eq('year', year)
        .eq('month', month)
        .single()

      if (monthlyAttempts && monthlyAttempts.attempts_used >= 3) {
        console.error('Monthly premium quest limit reached')
        return false
      }
    }

    // Create attempt record with in_progress status
    const { error } = await supabase
      .from('user_quest_attempts')
      .insert({
        user_id: userId,
        quest_id: questId,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error starting quest challenge:', error)
    return false
  }
}

/**
 * Submit quest answer
 */
export async function submitQuestAnswer(
  userId: string, 
  questId: string, 
  userAnswer: string, 
  timeTaken: number
): Promise<QuestSubmitResponse> {
  try {
    // Get quest details
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', questId)
      .single()

    if (questError || !quest) {
      return {
        success: false,
        is_correct: false,
        message: '퀘스트를 찾을 수 없습니다.'
      }
    }

    // Check if answer is correct
    const isCorrect = userAnswer.trim() === quest.answer?.trim()

    // Check for timeout
    const isTimeout = quest.time_limit && timeTaken > quest.time_limit
    const status = isTimeout ? 'timeout' : (isCorrect ? 'completed' : 'failed')

    // Update attempt record
    const { error: updateError } = await supabase
      .from('user_quest_attempts')
      .update({
        user_answer: userAnswer,
        is_correct: isCorrect,
        time_taken: timeTaken,
        status: status,
        submitted_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('quest_id', questId)

    if (updateError) throw updateError

    // If premium quest, increment monthly attempts
    if (quest.is_premium_only) {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1

      await supabase.rpc('increment_premium_attempts', {
        p_user_id: userId,
        p_year: year,
        p_month: month
      })
    }

    // If failed or timeout, return failure response
    if (!isCorrect || isTimeout) {
      return {
        success: true,
        is_correct: false,
        correct_answer: quest.answer || undefined,
        message: isTimeout ? '시간이 초과되었습니다.' : '정답이 아닙니다.'
      }
    }

    // Success - prepare reward
    const reward = {
      gold: quest.reward_gold || undefined,
      energy: quest.reward_energy || undefined,
      stock_name: quest.reward_stock_name || undefined,
      stock_value: quest.reward_stock_value || undefined,
      reward_type: quest.reward_type || undefined
    }

    return {
      success: true,
      is_correct: true,
      reward,
      message: '정답입니다! 보상을 획득했습니다.'
    }
  } catch (error) {
    console.error('Error submitting quest answer:', error)
    return {
      success: false,
      is_correct: false,
      message: '답안 제출 중 오류가 발생했습니다.'
    }
  }
}

/**
 * Claim quest reward
 */
export async function claimQuestReward(userId: string, questId: string): Promise<boolean> {
  try {
    // Get quest and attempt
    const { data: attempt } = await supabase
      .from('user_quest_attempts')
      .select('*, quests(*)')
      .eq('user_id', userId)
      .eq('quest_id', questId)
      .eq('status', 'completed')
      .eq('reward_claimed', false)
      .single()

    if (!attempt || !attempt.quests) {
      return false
    }

    const quest = attempt.quests as unknown as Quest

    // Update user profile with rewards
    const { data: profile } = await supabase
      .from('profiles')
      .select('gold, energy')
      .eq('id', userId)
      .single()

    if (!profile) return false

    const newGold = profile.gold + (quest.reward_gold || 0)
    const newEnergy = profile.energy + (quest.reward_energy || 0)

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ gold: newGold, energy: newEnergy })
      .eq('id', userId)

    if (profileError) throw profileError

    // Mark reward as claimed
    const { error: attemptError } = await supabase
      .from('user_quest_attempts')
      .update({ reward_claimed: true })
      .eq('user_id', userId)
      .eq('quest_id', questId)

    if (attemptError) throw attemptError

    return true
  } catch (error) {
    console.error('Error claiming quest reward:', error)
    return false
  }
}

/**
 * Update progress-based quest progress
 */
export async function updateQuestProgress(
  userId: string,
  progressType: string,
  value: number
): Promise<void> {
  try {
    // Find all active quests with this progress type
    const { data: quests } = await supabase
      .from('quests')
      .select('*')
      .eq('progress_type', progressType)
      .is('deleted_at', null)

    if (!quests || quests.length === 0) return

    for (const quest of quests) {
      // Upsert progress
      await supabase
        .from('user_quest_progress')
        .upsert({
          user_id: userId,
          quest_id: quest.id,
          progress: value,
          completed_at: value >= quest.target ? new Date().toISOString() : null
        }, {
          onConflict: 'user_id,quest_id'
        })
    }
  } catch (error) {
    console.error('Error updating quest progress:', error)
  }
}
