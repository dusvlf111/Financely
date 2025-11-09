// Quest System Types

export type QuestType = 'daily' | 'weekly' | 'monthly' | 'premium' | 'event'

export type QuestProgressType = 
  | 'attendance' 
  | 'problems_solved' 
  | 'accuracy' 
  | 'league_rank' 
  | 'premium_quests' 
  | 'streak'

export type QuestStatus = 'in_progress' | 'completed' | 'failed' | 'timeout'

export type RewardType = '확정' | '응모권'

export interface Quest {
  id: string
  title: string
  description: string
  type: QuestType
  question?: string // For premium and event quests
  answer?: string // Correct answer
  answer_options?: string[] // For multiple choice
  time_limit?: number // In seconds
  reward_gold: number
  reward_energy: number
  reward_stock_name?: string
  reward_stock_value?: number
  reward_type?: RewardType
  target: number // Target count for completion
  progress_type?: QuestProgressType
  is_premium_only: boolean
  max_participants?: number // For event quests
  created_at: string
  updated_at: string
  deleted_at?: string
}

export interface UserQuestAttempt {
  id: string
  user_id: string
  quest_id: string
  started_at: string
  submitted_at?: string
  user_answer?: string
  is_correct?: boolean
  time_taken?: number
  status: QuestStatus
  reward_claimed: boolean
  created_at: string
}

export interface UserQuestProgress {
  id: string
  user_id: string
  quest_id: string
  progress: number
  completed_at?: string
  reset_at?: string
  created_at: string
  updated_at: string
}

export interface QuestParticipant {
  id: string
  quest_id: string
  user_id: string
  joined_at: string
}

export interface PremiumQuestAttemptsMonthly {
  id: string
  user_id: string
  year: number
  month: number
  attempts_used: number
  created_at: string
  updated_at: string
}

// Combined type for UI display
export interface QuestWithProgress extends Quest {
  user_progress?: number
  user_completed_at?: string
  user_attempt?: UserQuestAttempt
  participants_count?: number
  remaining_participants?: number
}

// Types for quest challenges
export interface QuestChallengeRequest {
  quest_id: string
  user_id: string
}

export interface QuestSubmitRequest {
  quest_id: string
  user_id: string
  user_answer: string
  time_taken: number
}

export interface QuestSubmitResponse {
  success: boolean
  is_correct: boolean
  correct_answer?: string
  reward?: {
    gold?: number
    energy?: number
    stock_name?: string
    stock_value?: number
    reward_type?: RewardType
  }
  message: string
}

// Monthly quest specific types
export interface MonthlyQuestProgress {
  quest_id: string
  title: string
  progress: number
  target: number
  progress_percent: number
  days_remaining: number
  reward_stock_name: string
  reward_type: RewardType
  current_rank?: number
  target_rank?: number
}
