-- ============================================
-- 퀘스트 시드 데이터
-- PRD 문서에 정의된 모든 퀘스트 예제
-- ============================================

-- 기존 데이터 삭제 (선택사항)
-- TRUNCATE TABLE quests CASCADE;

-- ============================================
-- 1. 유료 퀘스트 (Premium Quests)
-- 특징: 유료 회원 전용, 고난이도, 소수점 주식 보상
-- ============================================

-- 1.1 채권 볼록성 활용 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '채권 볼록성 활용 문제',
  '액면가 10,000원, 표면이자율 6%, 만기 2년, 만기수익률 10%인 채권의 볼록성(Convexity)을 계산하시오',
  'premium',
  30,
  1,
  '약 3.2',
  '약 3.8',
  '약 4.1',
  '약 4.6',
  '약 5.2',
  2,
  '{"type": "stock_fraction", "symbol": "NVDA", "company": "엔비디아", "amount": 1000}'::jsonb,
  'active'
);

-- 1.2 부동산 가치평가 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '부동산 가치평가 문제',
  '부동산의 미래가치를 계산하는 방식이 아닌 것은?',
  'premium',
  20,
  1,
  'DCF(현금흐름할인법)',
  '수익환원법',
  '거래사례비교법',
  '블랙-숄즈 모델',
  '원가법',
  4,
  '{"type": "stock_fraction", "symbol": "TSLA", "company": "테슬라", "amount": 1000}'::jsonb,
  'active'
);

-- 1.3 듀레이션 계산 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '듀레이션 계산 문제',
  '만기수익률 15%, 표면이자율 12%, 액면금액 1,000원, 만기 5년인 채권의 맥컬리 듀레이션을 계산하시오',
  'premium',
  30,
  1,
  '약 3.2년',
  '약 4.1년',
  '약 4.5년',
  '약 5.0년',
  '약 5.5년',
  2,
  '{"type": "stock_fraction", "symbol": "005930.KS", "company": "삼성전자", "amount": 1000}'::jsonb,
  'active'
);

-- 1.4 CAPM 모델 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  'CAPM 모델 문제',
  '무위험수익률 3%, 시장수익률 10%, 베타 1.5인 주식의 기대수익률은?',
  'premium',
  20,
  1,
  '9.5%',
  '10.5%',
  '13.5%',
  '15%',
  '12%',
  3,
  '{"type": "stock_fraction", "symbol": "AAPL", "company": "애플", "amount": 1000}'::jsonb,
  'active'
);

-- 1.5 채권 가격 변동성 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '채권 가격 변동성 문제',
  '수정듀레이션 7.5, 볼록성 120일 때, 만기수익률 2% 상승 시 채권 가격 변화율은?',
  'premium',
  40,
  1,
  '-12.6%',
  '-10.2%',
  '-15.0%',
  '-7.8%',
  '-13.2%',
  1,
  '{"type": "stock_fraction", "symbol": "MSFT", "company": "마이크로소프트", "amount": 1000}'::jsonb,
  'active'
);

-- 1.6 포트폴리오 이론 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '포트폴리오 이론 문제',
  '효율적 프론티어 상의 포트폴리오가 아닌 것은?',
  'premium',
  5,
  1,
  '최소분산 포트폴리오',
  '최대 샤프비율 포트폴리오',
  '시장 포트폴리오',
  '최대손실 포트폴리오',
  '접점 포트폴리오',
  4,
  '{"type": "stock_fraction", "symbol": "AMZN", "company": "아마존", "amount": 1000}'::jsonb,
  'active'
);

-- 1.7 채권 면역전략 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '채권 면역전략 문제',
  '듀레이션 매칭 면역전략에서 고려 사항이 아닌 것은?',
  'premium',
  20,
  1,
  '듀레이션 일치',
  '자산 현재가치 ≥ 부채 현재가치',
  '볼록성 최대화',
  'PER 최소화',
  '리밸런싱 전략',
  4,
  '{"type": "stock_fraction", "symbol": "035720.KS", "company": "카카오", "amount": 1000}'::jsonb,
  'active'
);

-- 1.8 파생상품 평가 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '파생상품 평가 문제',
  '블랙-숄즈 모델의 기본 가정이 아닌 것은?',
  'premium',
  20,
  1,
  '무위험 차익거래 불가능',
  '변동성이 시간에 따라 변함',
  '연속적 거래 가능',
  '무위험이자율 일정',
  '주가는 로그정규분포',
  2,
  '{"type": "stock_fraction", "symbol": "035420.KS", "company": "네이버", "amount": 1000}'::jsonb,
  'active'
);

-- 1.9 VaR 계산 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  'VaR 계산 문제',
  '95% 신뢰수준 일일 VaR 500만원의 의미는?',
  'premium',
  30,
  1,
  '5일 중 1일은 500만원 이상 손실',
  '100일 중 95일은 500만원 이하 손실',
  '최대 손실액 500만원',
  '평균 손실액 500만원',
  '확률적 손실액 500만원',
  2,
  '{"type": "stock_fraction", "symbol": "005380.KS", "company": "현대차", "amount": 1000}'::jsonb,
  'active'
);

-- 1.10 채권 스프레드 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '채권 스프레드 문제',
  '회사채 스프레드 확대 원인이 아닌 것은?',
  'premium',
  20,
  1,
  '신용등급 하락',
  '유동성 위험 증가',
  '무위험이자율 하락',
  '시장 신뢰도 저하',
  '경기 침체 우려',
  3,
  '{"type": "stock_fraction", "symbol": "066570.KS", "company": "LG전자", "amount": 1000}'::jsonb,
  'active'
);

-- ============================================
-- 2. 깜짝 이벤트 퀘스트 (Event Quests)
-- 특징: 모든 회원 참여, 선착순 50명, 주식 응모권
-- ============================================

-- 2.1 옵션 합성 전략 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '깜짝 퀘스트: 옵션 합성 전략',
  '옵션 합성 전략이 아닌 것은?',
  'event',
  5,
  1,
  'Protective Put',
  'Covered Call',
  'Straddle',
  'Martingale Strategy',
  'Butterfly Spread',
  4,
  '{"type": "stock_entry", "symbol": "TSLA", "company": "테슬라", "label": "테슬라 주식 응모권", "quantity": 1, "limited": 50}'::jsonb,
  'active'
);

-- 2.2 채권 수익률 곡선 문제
INSERT INTO quests (
  title,
  description,
  type,
  time_limit_seconds,
  attempts_allowed,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  correct_option,
  reward,
  status
) VALUES (
  '깜짝 퀘스트: 수익률 곡선',
  '수익률 곡선 역전 시 예상 경제 상황은?',
  'event',
  5,
  1,
  '경기 과열',
  '경기 침체 가능성',
  '인플레이션 급등',
  '외환위기',
  '금리 상승',
  2,
  '{"type": "stock_entry", "symbol": "000660.KS", "company": "SK하이닉스", "label": "SK하이닉스 주식 응모권", "quantity": 1, "limited": 50}'::jsonb,
  'active'
);

-- ============================================
-- SQL 실행 완료 메시지
-- ============================================

-- 퀘스트 개수 확인
SELECT
  type,
  COUNT(*) as quest_count
FROM quests
GROUP BY type
ORDER BY type;

-- 전체 퀘스트 목록 확인
SELECT
  id,
  title,
  type,
  time_limit_seconds,
  status,
  created_at
FROM quests
ORDER BY type, created_at;
