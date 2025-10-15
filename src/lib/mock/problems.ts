export type Category = '금융 기초' | '저축/예금' | '주식 투자' | '채권' | '세금'

export type Problem = {
  id: string
  title: string
  description?: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: Category
  energyCost: number
  rewardGold: number
  correctAnswer?: string
  options?: string[]
  explanation?: string
}

const problems: Problem[] = [
  // 금융 기초
  {
    id: 'p1',
    title: '예금과 적금의 차이',
    description: '예금과 적금의 가장 큰 차이는 무엇일까요?',
    difficulty: 'easy',
    category: '금융 기초',
    energyCost: 1,
    rewardGold: 50,
    correctAnswer: 'A',
    options: ['A) 예금은 목돈을 한번에, 적금은 매달 저축', 'B) 예금이 적금보다 금리가 높다', 'C) 예금은 은행에서만 가능하다'],
    explanation: '예금은 목돈을 한번에 맡기는 것이고, 적금은 매달 일정액을 저축하는 것입니다.',
  },
  {
    id: 'p2',
    title: '예금자보호제도',
    description: '예금자보호제도로 보호받을 수 있는 금액은?',
    difficulty: 'easy',
    category: '금융 기초',
    energyCost: 1,
    rewardGold: 50,
    correctAnswer: 'B',
    options: ['A) 1억원', 'B) 5천만원', 'C) 무제한'],
    explanation: '예금자보호제도는 은행이 파산해도 1인당 최대 5,000만원(원금+이자)까지 보호합니다.',
  },
  {
    id: 'p3',
    title: '복리의 힘',
    description: '연 10% 복리로 100만원을 2년간 투자하면?',
    difficulty: 'easy',
    category: '금융 기초',
    energyCost: 1,
    rewardGold: 50,
    correctAnswer: 'B',
    options: ['A) 120만원', 'B) 121만원', 'C) 122만원'],
    explanation: '복리는 이자에 이자가 붙습니다. 1년차: 110만원, 2년차: 121만원',
  },

  // 저축/예금
  {
    id: 'p4',
    title: '적금 금리 비교',
    description: '같은 금액을 저축할 때 가장 유리한 것은?',
    difficulty: 'medium',
    category: '저축/예금',
    energyCost: 1,
    rewardGold: 60,
    correctAnswer: 'A',
    options: ['A) 연 4% 단리 적금', 'B) 연 3.8% 복리 적금', 'C) 둘 다 같다'],
    explanation: '장기적으로는 복리가 유리하지만, 적금은 기간이 짧아 단리가 더 나을 수 있습니다.',
  },
  {
    id: 'p5',
    title: '정기예금 만기',
    description: '정기예금을 중도해지하면?',
    difficulty: 'easy',
    category: '저축/예금',
    energyCost: 1,
    rewardGold: 50,
    correctAnswer: 'B',
    options: ['A) 이자를 받을 수 없다', 'B) 중도해지 이율로 이자를 받는다', 'C) 원금도 잃을 수 있다'],
    explanation: '중도해지 시 약정이율보다 낮은 중도해지 이율이 적용됩니다.',
  },

  // 주식 투자
  {
    id: 'p6',
    title: '주식의 배당',
    description: '배당금은 언제 받을 수 있나요?',
    difficulty: 'medium',
    category: '주식 투자',
    energyCost: 2,
    rewardGold: 60,
    correctAnswer: 'A',
    options: ['A) 배당 기준일에 주주명부에 있어야 함', 'B) 주식을 보유하기만 하면 됨', 'C) 1년 이상 보유해야 함'],
    explanation: '배당 기준일에 주주명부에 등재되어 있어야 배당을 받을 수 있습니다.',
  },
  {
    id: 'p7',
    title: 'PER의 의미',
    description: 'PER이 낮다는 것은 무엇을 의미하나요?',
    difficulty: 'hard',
    category: '주식 투자',
    energyCost: 2,
    rewardGold: 75,
    correctAnswer: 'B',
    options: ['A) 주가가 비싸다', 'B) 주가가 저평가되었을 수 있다', 'C) 배당이 많다'],
    explanation: 'PER(주가수익비율)이 낮으면 수익 대비 주가가 낮아 저평가되었을 가능성이 있습니다.',
  },
  {
    id: 'p8',
    title: '분산투자의 중요성',
    description: '분산투자를 해야 하는 이유는?',
    difficulty: 'medium',
    category: '주식 투자',
    energyCost: 2,
    rewardGold: 60,
    correctAnswer: 'A',
    options: ['A) 리스크를 줄이기 위해', 'B) 수익을 극대화하기 위해', 'C) 세금을 줄이기 위해'],
    explanation: '분산투자는 한 종목의 하락 위험을 다른 종목으로 분산시켜 전체 리스크를 줄입니다.',
  },

  // 채권
  {
    id: 'p9',
    title: '채권의 기본',
    description: '채권이란 무엇인가요?',
    difficulty: 'easy',
    category: '채권',
    energyCost: 1,
    rewardGold: 50,
    correctAnswer: 'B',
    options: ['A) 주식의 일종', 'B) 빌려준 돈에 대한 증서', 'C) 예금 상품'],
    explanation: '채권은 정부나 기업이 자금을 빌리며 발행하는 차용증서입니다.',
  },
  {
    id: 'p10',
    title: '금리와 채권 가격',
    description: '금리가 오르면 채권 가격은?',
    difficulty: 'medium',
    category: '채권',
    energyCost: 2,
    rewardGold: 60,
    correctAnswer: 'B',
    options: ['A) 오른다', 'B) 내린다', 'C) 변화없다'],
    explanation: '금리가 오르면 신규 채권의 수익률이 높아져 기존 채권의 매력이 떨어지므로 가격이 내립니다.',
  },

  // 세금
  {
    id: 'p11',
    title: '금융소득종합과세',
    description: '금융소득종합과세 기준금액은?',
    difficulty: 'medium',
    category: '세금',
    energyCost: 2,
    rewardGold: 60,
    correctAnswer: 'A',
    options: ['A) 연 2,000만원 초과', 'B) 연 5,000만원 초과', 'C) 연 1억원 초과'],
    explanation: '이자+배당 소득이 연 2,000만원을 초과하면 다른 소득과 합산하여 종합과세 됩니다.',
  },
  {
    id: 'p12',
    title: '배당소득세',
    description: '주식 배당금에 부과되는 세율은?',
    difficulty: 'medium',
    category: '세금',
    energyCost: 2,
    rewardGold: 60,
    correctAnswer: 'B',
    options: ['A) 14%', 'B) 15.4%', 'C) 20%'],
    explanation: '배당소득세는 15.4%(소득세 14% + 지방소득세 1.4%)입니다.',
  },
]

export default problems

export const categories: Category[] = ['금융 기초', '저축/예금', '주식 투자', '채권', '세금']
