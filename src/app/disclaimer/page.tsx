export default function DisclaimerPage() {
  return (
    <div className="max-w-[768px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">
        AI 어시스턴트 서비스 면책 조항
      </h1>

      <div className="card-animated p-6 space-y-6 text-sm text-neutral-700 leading-relaxed">
        <p className="text-neutral-600">
          본 AI 어시스턴트 서비스(이하 &apos;서비스&apos;)를 이용하기 전, 아래의
          면책 조항을 반드시 확인하시기 바랍니다. 서비스를 이용하는 것은 본
          조항에 동의하는 것으로 간주됩니다.
        </p>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mt-3">
            1. 정보의 정확성 및 한계
          </h2>
          <ul className="space-y-2 pl-4">
            <li>
              본 서비스는 인공지능 기술을 기반으로 정보를 제공하며, AI의 특성상
              사실과 다른 정보(Hallucination)를 생성하거나 최신 정보를 반영하지
              못할 수 있습니다. 따라서 AI가 제공하는 답변의 완전성, 신뢰성,
              정확성을 보장하지 않으며, 회사의 공식적인 견해와 다를 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mt-3">
            2. 금융 및 투자 관련 면책
          </h2>
          <ul className="space-y-2 pl-4">
            <li>
              본 서비스는 투자 자문, 재무 설계, 주식 종목 추천 등 전문적인 금융
              컨설팅을 목적으로 설계되지 않았습니다. AI가 제공하는 모든 금융
              관련 정보나 의견은 단순 참고용일 뿐이며, 이를 투자의 근거로
              삼아서는 안 됩니다.
            </li>
            <li>
              본 서비스는 특정 주식 종목이나 금융 상품을 추천하도록 설계되지
              않았습니다. 만약 AI가 대화 맥락상 특정 종목을 추천하는 듯한 발언을
              하거나 긍정/부정적인 전망을 제시하더라도, 이는 AI의 기술적 오류
              또는 텍스트 생성 과정의 우연한 결과일 뿐이며 회사의 투자 권유가
              아닙니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mt-3">
            3. 책임의 제한
          </h2>
          <ul className="space-y-2 pl-4">
            <li>
              사용자는 AI의 답변을 맹신하여서는 안 되며, 중요한 법적, 의학적,
              금융적 결정을 내리기 전에는 반드시 해당 분야 전문가의 조언을
              별도로 구해야 합니다.
            </li>
            <li>
              사용자가 AI의 답변(오류로 인해 생성된 종목 추천 포함)을 신뢰하여
              진행한 주식 투자, 금융 거래 등으로 인해 발생한 금전적 손실 및 기타
              피해에 대해 회사는 민·형사상 어떠한 법적 책임도 지지 않습니다.
            </li>
            <li className="mt-2">
              모든 투자의 최종적인 판단과 그에 따른 책임은 사용자 본인에게
              있음을 명시합니다.
            </li>
          </ul>
        </section>

        <div className="pt-4 border-t border-neutral-200">
          <p className="text-xs text-neutral-500 text-center">
            본 면책 조항은 2025년 11월 26일부터 시행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
