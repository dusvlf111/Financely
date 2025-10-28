"use client"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  const handleCTA = () => {
    router.push('/login')
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 5초 이내 이해 */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            {/* 로고 */}
            <div className="flex justify-center mb-8 animate-fade-in-down">
              <Image
                src="/favicon/apple-icon-180x180.png"
                alt="Financely"
                width={96}
                height={96}
                className="w-20 h-20 md:w-24 md:h-24 drop-shadow-2xl"
              />
            </div>

            {/* 메인 헤드라인 - 실제 문제 반영 */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              주식 시작했다가<br />
              <span className="text-yellow-300">손해보고 포기</span>하셨나요?
            </h1>

            {/* 서브 헤드라인 */}
            <p className="text-xl md:text-2xl mb-4 text-white/90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              퀘스트 달성하면 실제 주식을 받는<br className="md:hidden" />
              게임형 금융 학습
            </p>

            <p className="text-lg mb-8 text-white/80 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              문제 풀어 골드 모으고, 퀘스트로 자산 쌓기
            </p>

            {/* CTA 버튼 */}
            <button
              onClick={handleCTA}
              className="bg-yellow-400 text-primary-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all shadow-2xl animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            >
              무료로 시작하기
            </button>

            <p className="mt-4 text-sm text-white/80">
              가입 즉시 150골드 + 7일 무제한 에너지
            </p>
          </div>
        </div>
      </section>

      {/* 데이터 기반 문제 제기 Section */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-800">
              이런 고민, 혼자만의 고민이 아닙니다
            </h2>
            <p className="text-lg text-neutral-600">
              많은 20대가 같은 어려움을 겪고 있어요
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div
              id="problem-1"
              data-animate
              className="bg-white p-6 rounded-2xl shadow-md scroll-animate"
            >
              <h3 className="text-xl font-bold mb-3 text-neutral-800">&quot;용어가 너무 어려워&quot;</h3>
              <p className="text-neutral-600 text-sm mb-3">
                복리, 인플레이션, 분산투자...<br />
                기본 개념도 이해 못 하고 투자 시작
              </p>
              <div className="text-xs text-neutral-500 bg-neutral-100 p-2 rounded">
                서상진(23세), 주식 2개월차
              </div>
            </div>

            <div
              id="problem-2"
              data-animate
              className="bg-white p-6 rounded-2xl shadow-md scroll-animate"
              style={{ transitionDelay: '0.1s' }}
            >
              <h3 className="text-xl font-bold mb-3 text-neutral-800">&quot;공부는 지루해&quot;</h3>
              <p className="text-neutral-600 text-sm mb-3">
                유튜브 봐도 이해 안 되고<br />
                학원은 비싸고 시간도 없어
              </p>
              <div className="text-xs text-neutral-500 bg-neutral-100 p-2 rounded">
                이동우(25세), 레버리지 투자 손실
              </div>
            </div>

            <div
              id="problem-3"
              data-animate
              className="bg-white p-6 rounded-2xl shadow-md scroll-animate"
              style={{ transitionDelay: '0.2s' }}
            >
              <h3 className="text-xl font-bold mb-3 text-neutral-800">&quot;결국 손해보고 포기&quot;</h3>
              <p className="text-neutral-600 text-sm mb-3">
                뉴스에 민감하게 반응해서<br />
                손실 보고 투자 포기
              </p>
              <div className="text-xs text-neutral-500 bg-neutral-100 p-2 rounded">
                김주빈(23세), 투자 시작 1일차
              </div>
            </div>
          </div>

          {/* 핵심 통계 */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h4 className="font-bold text-lg mb-2 text-neutral-800">핵심 문제</h4>
            <p className="text-neutral-700">
              <span className="font-bold">20대 청년들은 체계적인 금융 지식 없이 주식투자를 시작</span>하여 높은 확률로 실패하고 포기합니다.<br />
              <span className="text-sm text-neutral-600">출처: 금융감독원 「2024 전국민 금융이해력 조사」</span>
            </p>
          </div>
        </div>
      </section>

      {/* 해결방안 Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-800">
            Financely가 다릅니다
          </h2>
          <p className="text-center text-neutral-600 mb-12">
            게임처럼 재미있게 배우면서 <span className="font-bold text-primary-600">실제 주식 보상</span>까지
          </p>

          <div className="space-y-16">
            {/* Feature 1 - 핵심 차별화 */}
            <div
              id="feature-1"
              data-animate
              className="flex flex-col md:flex-row items-center gap-8 scroll-animate"
            >
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-[300px]">
                  <Image
                    src="/mockup design/lean_page.png"
                    alt="학습 페이지 - 골드 차트"
                    width={300}
                    height={600}
                    className="w-full h-auto drop-shadow-2xl"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary-600">
                  퀘스트 완료하면 자산이 쌓입니다
                </h3>
                <p className="text-lg text-neutral-700 mb-4">
                  문제를 풀어 골드를 모으고<br />
                  <span className="font-bold">퀘스트 달성 시 실제 주식 보상</span>
                </p>
                <ul className="space-y-2 text-neutral-600">
                  <li>• 문제 풀면 학습 골드 획득</li>
                  <li>• 퀘스트 완료하면 실제 주식 보상</li>
                  <li>• 베이직 플랜 기준 월 최대 8,000원</li>
                  <li>• 연속 정답 시 골드 20% 보너스</li>
                </ul>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              id="feature-2"
              data-animate
              className="flex flex-col md:flex-row-reverse items-center gap-8 scroll-animate"
            >
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-[300px]">
                  <Image
                    src="/mockup design/problems_page.png"
                    alt="문제 풀이 페이지"
                    width={300}
                    height={600}
                    className="w-full h-auto drop-shadow-2xl"
                  />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary-600">
                  게임처럼 재미있는 학습
                </h3>
                <p className="text-lg text-neutral-700 mb-4">
                  지루한 강의는 NO!<br />
                  레벨업하며 성장하는 재미
                </p>
                <ul className="space-y-2 text-neutral-600">
                  <li>• Bronze → Silver → Gold → Platinum → Master</li>
                  <li>• 연속 출석 배지 (7일, 30일, 100일)</li>
                  <li>• 주간 리그 랭킹 경쟁</li>
                  <li>• 하루 10분, 1문제 1-2분</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              id="feature-3"
              data-animate
              className="flex flex-col md:flex-row items-center gap-8 scroll-animate"
            >
              <div className="flex-1">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 w-full h-64 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary-600">
                  취업에도 도움되는 학습
                </h3>
                <p className="text-lg text-neutral-700 mb-4">
                  프리미엄 플랜으로<br />
                  금융 자격증 3종 준비 가능
                </p>
                <ul className="space-y-2 text-neutral-600">
                  <li>• 펀드투자권유자문인력 (합격 시 10,000원)</li>
                  <li>• 증권투자권유자문인력 (합격 시 15,000원)</li>
                  <li>• 투자자산운용사 (합격 시 50,000원)</li>
                  <li>• 학원비 10-30만원 → 월 19,900원</li>
                </ul>
              </div>
            </div>

            {/* Feature 4 - 퀘스트 보상 */}
            <div
              id="feature-4"
              data-animate
              className="flex flex-col md:flex-row-reverse items-center gap-8 scroll-animate"
            >
              <div className="flex-1">
                <div className="bg-gradient-to-br from-pink-500 to-red-500 w-full h-64 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-primary-600">
                  퀘스트 달성하면 실제 주식
                </h3>
                <p className="text-lg text-neutral-700 mb-4">
                  일일/주간/월간 퀘스트를 완료하면<br />
                  실제 주식 보상을 받아요
                </p>
                <ul className="space-y-2 text-neutral-600">
                  <li>• 일일 퀘스트: 5문제 풀기</li>
                  <li>• 주간 퀘스트: 연속 7일 학습</li>
                  <li>• 월간 퀘스트: 레벨업 달성</li>
                  <li>• 퀘스트 보상으로 실제 주식 적립</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 이벤트 Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border-2 border-white/30">
            <div className="inline-block bg-yellow-400 text-purple-700 px-4 py-2 rounded-full font-bold mb-6">
              런칭 기념 이벤트
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              지금 가입하면<br />
              특별한 혜택을 드려요!
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-bold text-lg mb-2">웰컴 보너스</h4>
                <p className="text-white/90">가입 즉시 150골드 지급</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-bold text-lg mb-2">무제한 에너지 7일</h4>
                <p className="text-white/90">첫 7일간 에너지 무제한 체험</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-bold text-lg mb-2">베이직 50% 할인</h4>
                <p className="text-white/90">첫 달 9,900원 → 4,900원</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
                <h4 className="font-bold text-lg mb-2">얼리버드 뱃지</h4>
                <p className="text-white/90">초기 유저만 받는 특별 뱃지</p>
              </div>
            </div>

            <p className="text-yellow-300 font-bold mb-6">
              선착순 1,000명 한정!
            </p>

            <button
              onClick={handleCTA}
              className="bg-yellow-400 text-purple-700 px-10 py-5 rounded-full text-xl font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all shadow-2xl"
            >
              지금 바로 시작하기 →
            </button>
          </div>
        </div>
      </section>

      {/* 가격 Section - 실제 비즈니스 모델 반영 */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-purple-50/20 to-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-neutral-800">
            커피 한 잔 값으로 시작
          </h2>
          <p className="text-center text-neutral-600 mb-12">
            퀘스트 완료하면 주식 보상으로 구독료 이상 돌려받기
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-neutral-200">
              <h3 className="text-2xl font-bold mb-2 text-neutral-800">무료</h3>
              <div className="text-4xl font-bold mb-6 text-primary-600">
                ₩0
              </div>
              <ul className="space-y-3 mb-8 text-neutral-700 text-sm">
                <li>• 하루 5문제 (에너지 5개)</li>
                <li>• Bronze 티어까지</li>
                <li>• 기초 카테고리</li>
                <li>• 리그 참여</li>
                <li className="text-neutral-400">• 광고 있음</li>
                <li className="text-neutral-400">• 주식 보상 없음</li>
              </ul>
              <button
                onClick={handleCTA}
                className="w-full bg-neutral-200 text-neutral-800 py-3 rounded-full font-bold hover:bg-neutral-300 transition-colors"
              >
                무료로 시작
              </button>
              <p className="text-xs text-neutral-500 text-center mt-3">
                7일 무제한 체험 제공
              </p>
            </div>

            {/* Basic Plan - 추천 */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 rounded-2xl shadow-xl border-2 border-primary-400 transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-primary-700 px-4 py-1 rounded-full text-sm font-bold">
                인기
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">베이직</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <div className="text-4xl font-bold text-white">
                  ₩9,900
                </div>
                <div className="text-white/80 text-sm">/ 월</div>
              </div>
              <ul className="space-y-3 mb-8 text-white text-sm">
                <li>• 무제한 학습 (에너지 무한)</li>
                <li>• 전체 티어 (Bronze ~ Master)</li>
                <li>• 모든 카테고리</li>
                <li>• 광고 제거</li>
                <li>• <span className="font-bold">주식 보상 (월 최대 8,000원)</span></li>
                <li>• 연속 정답 보너스 20%</li>
              </ul>
              <button
                onClick={handleCTA}
                className="w-full bg-yellow-400 text-primary-700 py-3 rounded-full font-bold hover:bg-yellow-300 transition-colors shadow-lg"
              >
                베이직 시작
              </button>
              <p className="text-xs text-white/80 text-center mt-3">
                첫 달 50% 할인 → 4,900원
              </p>
            </div>

            {/* Premium Plan */}
            <div className="bg-white p-8 rounded-2xl shadow-md border-2 border-primary-200">
              <h3 className="text-2xl font-bold mb-2 text-neutral-800">프리미엄</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <div className="text-4xl font-bold text-primary-600">
                  ₩19,900
                </div>
                <div className="text-neutral-600 text-sm">/ 월</div>
              </div>
              <ul className="space-y-3 mb-8 text-neutral-700 text-sm">
                <li>• 베이직 전체 기능</li>
                <li>• <span className="font-bold">주식 보상 2.5배 (월 최대 25,000원)</span></li>
                <li>• <span className="font-bold">자격증 트랙 전체 (3종)</span></li>
                <li>• AI 맞춤 학습 추천</li>
                <li>• 1:1 멘토링 (월 1회)</li>
                <li>• <span className="font-bold">자격증 합격 보너스 (최대 50,000원)</span></li>
              </ul>
              <button
                onClick={handleCTA}
                className="w-full bg-primary-600 text-white py-3 rounded-full font-bold hover:bg-primary-700 transition-colors"
              >
                프리미엄 시작
              </button>
              <p className="text-xs text-neutral-500 text-center mt-3">
                7일 무료 체험 가능
              </p>
            </div>
          </div>

          {/* 비교 강조 */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-primary-500 p-6 rounded-lg">
            <h4 className="font-bold text-lg mb-2 text-neutral-800">자격증 학원과 비교</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-600 mb-2">일반 금융자격증 학원</p>
                <ul className="space-y-1 text-neutral-700">
                  <li>• 과목당 10-30만원</li>
                  <li>• 오프라인 고정 시간</li>
                  <li>• 기초 교육 없음</li>
                </ul>
              </div>
              <div>
                <p className="text-primary-600 font-bold mb-2">Financely 프리미엄</p>
                <ul className="space-y-1 text-neutral-700">
                  <li>• <span className="font-bold">월 19,900원 (자격증 3종)</span></li>
                  <li>• 언제 어디서나</li>
                  <li>• 기초부터 체계적 학습</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            다시는 손해보고 포기하지 마세요
          </h2>
          <p className="text-xl mb-4 text-white/90">
            체계적으로 배우고, 실제 자산을 쌓고, 전문가로 성장하세요
          </p>
          <p className="text-lg mb-8 text-white/80">
            선착순 1,000명에게 특별 혜택 제공 중
          </p>

          <button
            onClick={handleCTA}
            className="bg-yellow-400 text-primary-600 px-12 py-5 rounded-full text-xl font-bold hover:bg-yellow-300 transform hover:scale-105 transition-all shadow-2xl inline-flex items-center gap-2"
          >
            지금 무료로 시작하기
            <span className="text-2xl">→</span>
          </button>

          <p className="mt-6 text-sm text-white/80">
            신용카드 등록 불필요 · 7일 무제한 체험 · 언제든 해지 가능
          </p>

          {/* 사회적 증거 */}
          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold mb-1">10분</div>
              <div className="text-sm text-white/70">하루 평균 학습시간</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">70%</div>
              <div className="text-sm text-white/70">3개월 리텐션</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">15문제</div>
              <div className="text-sm text-white/70">일평균 학습량</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-neutral-300 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/favicon/apple-icon-180x180.png"
              alt="Financely"
              width={48}
              height={48}
              className="w-12 h-12 mb-3 opacity-90"
            />
            <p className="font-bold text-white text-lg mb-2">Financely</p>
            <p className="text-sm text-neutral-400 text-center max-w-md">
              게임처럼 재미있게 배우고, 실제 자산을 쌓는<br />
              20대를 위한 금융 학습 플랫폼
            </p>
          </div>

          <div className="border-t border-neutral-700 pt-6">
            <p className="text-sm text-center text-neutral-400">
              © 2025 Financely. All rights reserved.
            </p>
            <p className="text-xs text-center text-neutral-500 mt-2">
              20대가 금융 공부를 포기하지 않도록
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
