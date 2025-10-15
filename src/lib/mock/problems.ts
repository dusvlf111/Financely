export type Category = '금융 기초' | '저축과 예산' | '신용 관리' | '주식 투자' | '세금'

export const categories: Category[] = ['금융 기초', '저축과 예산', '신용 관리', '주식 투자', '세금']

export type Problem = {
  id: string
  category: Category
  difficulty: 'easy' | 'medium' | 'hard'
  title: string
  description: string
  options?: string[]
  correctAnswer: string
  explanation: string
  energyCost: number
  rewardGold: number
}

const problems: Problem[] = [
  {
    id: 'p1',
    category: '금융 기초',
    difficulty: 'easy',
    title: '예금과 적금의 차이',
    description: '목돈을 한 번에 은행에 맡기는 금융 상품은 무엇일까요?',
    options: ['A) 예금', 'B) 적금', 'C) 펀드', 'D) 주식'],
    correctAnswer: 'A',
    explanation: '예금은 목돈을 한 번에 넣어두는 것이고, 적금은 매달 일정 금액을 꾸준히 넣어 목돈을 만드는 상품입니다.',
    energyCost: 1,
    rewardGold: 32,
  },
  {
    id: 'p2',
    category: '금융 기초',
    difficulty: 'easy',
    title: '복리 계산의 이해',
    description: '원금뿐만 아니라 이자에도 이자가 붙는 계산 방식을 무엇이라고 할까요?',
    options: ['A) 단리', 'B) 복리', 'C) 연리', 'D) 월리'],
    correctAnswer: 'B',
    explanation: '복리는 이자가 원금에 더해져 새로운 원금을 형성하고, 그 합산된 금액에 다시 이자가 붙는 방식으로, 장기 투자 시 자산을 크게 불릴 수 있는 원리입니다.',
    energyCost: 1,
    rewardGold: 38,
  },
  {
    id: 'p3',
    category: '저축과 예산',
    difficulty: 'easy',
    title: '비상금의 중요성',
    description: '예상치 못한 지출을 대비해 마련해두는 돈을 무엇이라고 할까요?',
    options: ['A) 쌈짓돈', 'B) 비상금', 'C) 잉여자금', 'D) 투자금'],
    correctAnswer: 'B',
    explanation: '비상금은 보통 3~6개월치 생활비 규모로 준비하며, 갑작스러운 실직, 질병 등 위기 상황에서 큰 도움이 됩니다.',
    energyCost: 1,
    rewardGold: 34,
  },
  {
    id: 'p4',
    category: '신용 관리',
    difficulty: 'medium',
    title: '신용점수 올리는 법',
    description: '다음 중 신용점수를 올리는 데 가장 도움이 되는 행동은 무엇일까요?',
    options: ['A) 신용카드 많이 발급받기', 'B) 대출 전혀 받지 않기', 'C) 체크카드 꾸준히 사용하기', 'D) 현금 서비스 자주 이용하기'],
    correctAnswer: 'C',
    explanation: '체크카드를 꾸준히 사용하고, 신용카드는 한도를 채우지 않으면서 연체 없이 사용하는 것이 신용점수 관리에 긍정적입니다.',
    energyCost: 1,
    rewardGold: 47,
  },
  {
    id: 'p5',
    category: '주식 투자',
    difficulty: 'medium',
    title: '분산투자의 개념',
    description: '여러 자산에 나누어 투자하여 위험을 줄이는 전략을 무엇이라고 할까요?',
    options: ['A) 몰빵투자', 'B) 단타매매', 'C) 분산투자', 'D) 가치투자'],
    correctAnswer: 'C',
    explanation: '"계란을 한 바구니에 담지 말라"는 격언처럼, 분산투자는 특정 자산의 가치 하락이 전체 포트폴리오에 미치는 영향을 줄여 안정성을 높이는 핵심 전략입니다.',
    energyCost: 1,
    rewardGold: 58,
  },
  {
    id: 'p6',
    category: '주식 투자',
    difficulty: 'hard',
    title: 'PER의 의미',
    description: '주가를 주당순이익(EPS)으로 나눈 값으로, 기업의 수익성 대비 주가가 고평가인지 저평가인지 판단하는 지표는 무엇일까요?',
    correctAnswer: 'PER',
    explanation: 'PER(Price-to-Earnings Ratio, 주가수익비율)은 낮을수록 주가가 저평가되었다고 해석될 수 있습니다. 동종 업계의 다른 기업들과 비교하여 상대적인 가치를 판단하는 데 유용합니다.',
    energyCost: 2,
    rewardGold: 71,
  },
  {
    id: 'p7',
    category: '세금',
    difficulty: 'medium',
    title: '연말정산이란?',
    description: '1년 동안의 총급여액에 대한 근로소득세를 연말에 다시 따져보고, 실소득보다 많은 세금을 냈으면 그만큼을 돌려주는 절차는 무엇일까요?',
    correctAnswer: '연말정산',
    explanation: '연말정산은 "13월의 월급"이라고도 불리며, 각종 공제 항목을 꼼꼼히 챙겨 신고하면 상당한 금액을 환급받을 수 있습니다.',
    energyCost: 1,
    rewardGold: 52,
  },
  {
    id: 'p8',
    category: '저축과 예산',
    difficulty: 'medium',
    title: '파킹통장이란?',
    description: '잠시 주차하듯 단기간 돈을 보관해도 일반 수시입출금 통장보다 높은 금리를 제공하는 통장을 무엇이라고 할까요?',
    correctAnswer: '파킹통장',
    explanation: '파킹통장은 비상금이나 단기 투자 대기 자금을 보관하기에 매우 유용하며, 하루만 맡겨도 이자가 붙는 장점이 있습니다.',
    energyCost: 1,
    rewardGold: 45,
  },
  {
    id: 'p9',
    category: '신용 관리',
    difficulty: 'hard',
    title: 'DSR 규제란?',
    description: '모든 가계대출 원리금 상환액을 연간 소득으로 나눈 비율로, 대출 상환 능력을 심사하는 데 사용되는 지표는 무엇일까요?',
    correctAnswer: 'DSR',
    explanation: 'DSR(Debt Service Ratio, 총부채원리금상환비율)은 차주의 상환 능력을 더 정확히 파악하기 위해 도입된 규제입니다. DSR이 높으면 추가 대출이 어려워질 수 있습니다.',
    energyCost: 2,
    rewardGold: 76,
  },
  {
    id: 'p10',
    category: '주식 투자',
    difficulty: 'easy',
    title: '코스피(KOSPI)란?',
    description: '한국거래소의 유가증권시장에 상장된 회사들의 주식을 종합하여 나타내는 주가지수는 무엇일까요?',
    correctAnswer: '코스피',
    explanation: '코스피(KOSPI)는 대한민국 주식 시장의 전반적인 동향을 나타내는 가장 대표적인 지수입니다.',
    energyCost: 1,
    rewardGold: 29,
  },
]

export default problems