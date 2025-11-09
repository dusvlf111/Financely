-- Insert Daily Quests
INSERT INTO quests (title, description, type, target, progress_type, reward_gold, reward_energy) VALUES
('오늘의 학습', '문제 3개 이상 풀기', 'daily', 3, 'problems_solved', 100, 0),
('꾸준한 학습자', '오늘의 학습 완료', 'daily', 1, NULL, 50, 0),
('완벽주의자', '정답률 80% 이상 달성', 'daily', 80, 'accuracy', 150, 0);

-- Insert Weekly Quests
INSERT INTO quests (title, description, type, target, progress_type, reward_gold, reward_energy) VALUES
('출석왕', '5일 연속 출석하기', 'weekly', 5, 'attendance', 200, 0),
('연승 행진', '10문제 연속 맞추기', 'weekly', 10, 'streak', 300, 0),
('주간 학습 목표', '주간 문제 50개 풀기', 'weekly', 50, 'problems_solved', 300, 0),
('완벽한 한 주', '모든 일일 퀘스트 완료', 'weekly', 7, NULL, 400, 0);

-- Insert Monthly Quests
INSERT INTO quests (title, description, type, target, progress_type, reward_stock_name, reward_stock_value, reward_type, is_premium_only) VALUES
('리그 상위 랭커 도전', '리그에서 상위 20% 안에 들기', 'monthly', 20, 'league_rank', '일라이릴리', 10000, '확정', false),
('완벽한 출석 마스터', '연속 출석 25회 이상', 'monthly', 25, 'attendance', '마이크로소프트', 10000, '응모권', false),
('학습왕 도전', '월간 문제 풀이 500개 이상', 'monthly', 500, 'problems_solved', '애플', 10000, '응모권', false),
('완벽주의자', '월간 정답률 90% 이상 유지 (최소 100문제)', 'monthly', 90, 'accuracy', '구글', 10000, '응모권', false),
('유료 퀘스트 마스터', '유료 퀘스트 3개 모두 성공', 'monthly', 3, 'premium_quests', '엔비디아', 10000, '확정', true);

-- Insert Premium Quests
INSERT INTO quests (title, description, type, question, answer, time_limit, reward_stock_name, reward_stock_value, reward_type, is_premium_only) VALUES
('채권 볼록성 활용 문제', '고급 금융지식 문제', 'premium', 
'액면가 10,000원, 표면이자율 6%, 만기 2년, 만기수익률 10%인 채권의 볼록성(Convexity)을 계산하시오', 
'3.77', 30, '엔비디아', 1000, '확정', true),

('부동산 가치평가 문제', '고급 금융지식 문제', 'premium',
'부동산의 미래가치를 계산하는 방식이 아닌 것은?',
'④',
20,
'테슬라',
1000,
'확정',
true),

('듀레이션 계산 문제', '고급 금융지식 문제', 'premium',
'만기수익률 15%, 표면이자율 12%, 액면금액 1,000원, 만기 5년인 채권의 맥컬리 듀레이션을 계산하시오',
'4.15',
30,
'삼성전자',
1000,
'확정',
true),

('CAPM 모델 문제', '고급 금융지식 문제', 'premium',
'무위험수익률 3%, 시장수익률 10%, 베타 1.5인 주식의 기대수익률은?',
'③',
20,
'애플',
1000,
'확정',
true),

('채권 가격 변동성 문제', '고급 금융지식 문제', 'premium',
'수정듀레이션 7.5, 볼록성 120일 때, 만기수익률 2% 상승 시 채권 가격 변화율은?',
'①',
40,
'마이크로소프트',
1000,
'확정',
true),

('포트폴리오 이론 문제', '고급 금융지식 문제', 'premium',
'효율적 프론티어 상의 포트폴리오가 아닌 것은?',
'④',
5,
'아마존',
1000,
'확정',
true),

('채권 면역전략 문제', '고급 금융지식 문제', 'premium',
'듀레이션 매칭 면역전략에서 고려 사항이 아닌 것은?',
'④',
20,
'카카오',
1000,
'확정',
true),

('파생상품 평가 문제', '고급 금융지식 문제', 'premium',
'블랙-숄즈 모델의 기본 가정이 아닌 것은?',
'②',
20,
'네이버',
1000,
'확정',
true),

('VaR 계산 문제', '고급 금융지식 문제', 'premium',
'95% 신뢰수준 일일 VaR 500만원의 의미는?',
'②',
30,
'현대차',
1000,
'확정',
true),

('채권 스프레드 문제', '고급 금융지식 문제', 'premium',
'회사채 스프레드 확대 원인이 아닌 것은?',
'③',
20,
'LG전자',
1000,
'확정',
true);

-- Update premium quests with answer options
UPDATE quests SET answer_options = '["① DCF(현금흐름할인법)", "② 수익환원법", "③ 거래사례비교법", "④ 블랙-숄즈 모델"]'::jsonb
WHERE title = '부동산 가치평가 문제';

UPDATE quests SET answer_options = '["① 9.5%", "② 10.5%", "③ 13.5%", "④ 15%"]'::jsonb
WHERE title = 'CAPM 모델 문제';

UPDATE quests SET answer_options = '["① -12.6%", "② -10.2%", "③ -15.0%", "④ -7.8%"]'::jsonb
WHERE title = '채권 가격 변동성 문제';

UPDATE quests SET answer_options = '["① 최소분산 포트폴리오", "② 최대 샤프비율 포트폴리오", "③ 시장 포트폴리오", "④ 최대손실 포트폴리오"]'::jsonb
WHERE title = '포트폴리오 이론 문제';

UPDATE quests SET answer_options = '["① 듀레이션 일치", "② 자산 현재가치 ≥ 부채 현재가치", "③ 볼록성 최대화", "④ PER 최소화"]'::jsonb
WHERE title = '채권 면역전략 문제';

UPDATE quests SET answer_options = '["① 무위험 차익거래 불가능", "② 변동성이 시간에 따라 변함", "③ 연속적 거래 가능", "④ 무위험이자율 일정"]'::jsonb
WHERE title = '파생상품 평가 문제';

UPDATE quests SET answer_options = '["① 5일 중 1일은 500만원 이상 손실", "② 100일 중 95일은 500만원 이하 손실", "③ 최대 손실액 500만원", "④ 평균 손실액 500만원"]'::jsonb
WHERE title = 'VaR 계산 문제';

UPDATE quests SET answer_options = '["① 신용등급 하락", "② 유동성 위험 증가", "③ 무위험이자율 하락", "④ 시장 신뢰도 저하"]'::jsonb
WHERE title = '채권 스프레드 문제';

-- Insert Event Quests (깜짝 퀘스트)
INSERT INTO quests (title, description, type, question, answer, answer_options, time_limit, reward_stock_name, reward_stock_value, reward_type, is_premium_only, max_participants) VALUES
('옵션 합성 전략 문제', '깜짝 이벤트 퀘스트', 'event',
'옵션 합성 전략이 아닌 것은?',
'④',
'["① Protective Put", "② Covered Call", "③ Straddle", "④ Martingale Strategy"]'::jsonb,
5,
'테슬라',
10000,
'응모권',
false,
50),

('채권 수익률 곡선 문제', '깜짝 이벤트 퀘스트', 'event',
'수익률 곡선 역전 시 예상 경제 상황은?',
'②',
'["① 경기 과열", "② 경기 침체 가능성", "③ 인플레이션 급등", "④ 외환위기"]'::jsonb,
5,
'SK하이닉스',
10000,
'응모권',
false,
50);

-- Comments
COMMENT ON TABLE quests IS 'Quest data including daily, weekly, monthly, premium, and event quests';
