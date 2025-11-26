import QuestPage from "@/app/quest/page";
import { render, screen } from "@testing-library/react";

describe("QuestPage placeholder state", () => {
  it("shows heading and preparation message", () => {
    render(<QuestPage />);

    expect(screen.getByRole("heading", { name: "퀘스트" })).toBeInTheDocument();
    expect(
      screen.getByText("퀘스트 관련 기능은 현재 준비중입니다.")
    ).toBeInTheDocument();
  });

  it("shows follow-up guidance text", () => {
    render(<QuestPage />);

    expect(
      screen.getByText("준비가 완료되면 다시 안내드릴게요!")
    ).toBeInTheDocument();
  });
});
