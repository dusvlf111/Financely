# 퀘스트 시드 데이터 적용 가이드

이 문서는 `seed_quests.sql` 파일을 Supabase에 적용하는 방법을 설명합니다.

## 📋 포함된 퀘스트

### 1. 유료 퀘스트 (Premium) - 10개
- 채권 볼록성 활용 문제 (30초)
- 부동산 가치평가 문제 (20초)
- 듀레이션 계산 문제 (30초)
- CAPM 모델 문제 (20초)
- 채권 가격 변동성 문제 (40초)
- 포트폴리오 이론 문제 (5초)
- 채권 면역전략 문제 (20초)
- 파생상품 평가 문제 (20초)
- VaR 계산 문제 (30초)
- 채권 스프레드 문제 (20초)

**특징:**
- 유료 회원 전용
- 고난이도 (투자자산운용사 시험 수준)
- 소수점 주식 1,000원 보상
- 1회 도전만 가능

### 2. 깜짝 이벤트 퀘스트 (Event) - 2개
- 옵션 합성 전략 문제 (5초)
- 채권 수익률 곡선 문제 (5초)

**특징:**
- 모든 회원 참여 가능
- 선착순 50명 제한
- 주식 응모권 보상
- 극한의 시간 제한 (5초)

## 🚀 Supabase에 적용하는 방법

### 방법 1: Supabase Dashboard 사용 (권장)

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard
   ```

2. **프로젝트 선택**
   - 본인의 Financely 프로젝트 선택

3. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭
   - 또는 직접 URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql`

4. **SQL 파일 내용 붙여넣기**
   - `seed_quests.sql` 파일의 전체 내용을 복사
   - SQL Editor에 붙여넣기

5. **실행**
   - `Run` 버튼 클릭 또는 `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

6. **결과 확인**
   - 하단에 퀘스트 개수와 목록이 표시됨
   - 오류가 없으면 성공!

### 방법 2: psql CLI 사용

```bash
# Supabase 데이터베이스에 연결
psql "postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres"

# SQL 파일 실행
\i supabase/seed_quests.sql
```

### 방법 3: Supabase CLI 사용

```bash
# Supabase 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref YOUR_PROJECT_REF

# SQL 실행
supabase db execute --file supabase/seed_quests.sql
```

## ✅ 적용 후 확인

### 1. Table Editor에서 확인
1. Supabase Dashboard → `Table Editor` 클릭
2. `quests` 테이블 선택
3. 12개의 퀘스트가 추가되었는지 확인

### 2. SQL로 확인
```sql
-- 타입별 퀘스트 개수
SELECT type, COUNT(*) as count
FROM quests
GROUP BY type;

-- 예상 결과:
-- premium: 10
-- event: 2
```

### 3. API로 확인
```bash
# 로컬 개발 서버 실행 후
curl -H "x-user-id: test-user-id" http://localhost:3000/api/quests?type=premium

# 또는 브라우저에서
http://localhost:3000/quest
```

## 🔄 데이터 초기화 (필요시)

기존 퀘스트 데이터를 모두 삭제하고 다시 시작하려면:

```sql
-- 모든 퀘스트 데이터 삭제
TRUNCATE TABLE quests CASCADE;

-- 그 후 seed_quests.sql 다시 실행
```

⚠️ **주의**: `CASCADE` 옵션은 관련된 `user_quests`와 `quest_rewards` 데이터도 함께 삭제합니다.

## 📝 추가 퀘스트 작성 가이드

새로운 퀘스트를 추가하려면 다음 형식을 따르세요:

```sql
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
  correct_option,  -- 1~5 사이의 정수
  reward,          -- JSON 형식
  status
) VALUES (
  '퀘스트 제목',
  '문제 설명',
  'premium',       -- 'daily', 'weekly', 'monthly', 'premium', 'event'
  30,              -- 제한 시간 (초)
  1,               -- 허용 시도 횟수
  '선택지 1',
  '선택지 2',
  '선택지 3',
  '선택지 4',
  '선택지 5',
  3,               -- 정답 (1~5)
  '{"type": "stock_fraction", "symbol": "AAPL", "company": "애플", "amount": 1000}'::jsonb,
  'active'
);
```

### Reward JSON 형식

**소수점 주식:**
```json
{
  "type": "stock_fraction",
  "symbol": "AAPL",
  "company": "애플",
  "amount": 1000
}
```

**주식 응모권:**
```json
{
  "type": "stock_entry",
  "symbol": "TSLA",
  "company": "테슬라",
  "label": "테슬라 주식 응모권",
  "quantity": 1,
  "limited": 50
}
```

**골드 & 경험치:**
```json
{
  "gold": 100,
  "xp": 50
}
```

## 🐛 문제 해결

### 1. "relation quests does not exist" 오류
마이그레이션이 실행되지 않았습니다. 먼저 다음을 실행하세요:
```bash
supabase db reset
# 또는
supabase migration up
```

### 2. "duplicate key value" 오류
퀘스트가 이미 존재합니다. 기존 데이터를 삭제하거나 `title`을 변경하세요.

### 3. JSON 파싱 오류
`reward` 필드에 `::jsonb`를 붙였는지 확인하세요.

## 📚 참고 문서

- [퀘스트 기능 PRD](../docs/1_Todo/퀘스트기능_PRD.md)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/sql-editor)
- [PostgreSQL JSON Functions](https://www.postgresql.org/docs/current/functions-json.html)
