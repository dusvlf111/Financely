export type InteractionPhase = 'idle' | 'starting' | 'question' | 'submitting' | 'result'

export interface QuestInteraction {
  phase: InteractionPhase
  selectedOption: number | null
  message: string | null
  error: string | null
  isSuccess: boolean | null
}

export type QuestInteractionState = Record<string, QuestInteraction>

export function createDefaultInteraction(): QuestInteraction {
  return {
    phase: 'idle',
    selectedOption: null,
    message: null,
    error: null,
    isSuccess: null,
  }
}
