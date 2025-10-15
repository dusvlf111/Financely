export type TutorialChoice = {
  id: string
  label: string
  gold: number
  text?: string
}

export type TutorialStep = {
  id: string
  title: string
  content: string
  choices: TutorialChoice[]
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: 's1',
    title: "민준이의 첫 월급",
    content:
      '민준이는 첫 월급을 받았습니다. 한 달 생활비와 저축, 그리고 소소한 즐거움 중 어떤 방식으로 분배할까요?',
    choices: [
      { id: 's1a', label: '저축하기 (안정적으로 +50G)', gold: 50 },
      { id: 's1b', label: '친구와 외식 (즐거움 +0G)', gold: 0 },
      { id: 's1c', label: '소액 투자 (리스크 있지만 +100G 가능)', gold: 100 },
    ],
  },
  {
    id: 's2',
    title: '급여일 소비 계획',
    content:
      '다음 달을 대비해 예산을 짤까요? 어느 쪽을 우선시 하시겠어요?',
    choices: [
      { id: 's2a', label: '비상금 적립 (+30G)', gold: 30 },
      { id: 's2b', label: '취미에 투자 (+10G)', gold: 10 },
      { id: 's2c', label: '전체 지출 낮추기 (+20G)', gold: 20 },
    ],
  },
  {
    id: 's3',
    title: '연속 보너스 확인',
    content:
      '연속 정답 보너스에 대해 배워봅시다. 문제를 연속으로 맞히면 더 많은 골드를 얻습니다. 마지막 문제를 풀어보시겠어요?',
    choices: [
      { id: 's3a', label: '예, 다음 문제 풀기 (+75G)', gold: 75 },
      { id: 's3b', label: '아니요, 나중에 (+0G)', gold: 0 },
    ],
  },
]

export default tutorialSteps
