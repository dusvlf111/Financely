import ProblemPage from "@/app/problems/[id]/page";
import { render, waitFor } from "@testing-library/react";

jest.mock("@/lib/context/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

let mockSelect: jest.Mock;
let mockEq: jest.Mock;
let mockSingle: jest.Mock;

jest.mock("@/lib/supabase/client", () => {
  return {
    supabase: {
      from: jest.fn(),
    },
  };
});

const mockUseAuth = jest.requireMock("@/lib/context/AuthProvider")
  .useAuth as jest.Mock;
const mockUseRouter = jest.requireMock("next/navigation")
  .useRouter as jest.Mock;
const mockUseParams = jest.requireMock("next/navigation")
  .useParams as jest.Mock;
const mockSupabaseFrom = jest.requireMock("@/lib/supabase/client").supabase
  .from as jest.Mock;

function setupProblemQuery() {
  mockSingle = jest.fn().mockResolvedValue({
    data: {
      id: "p1",
      category: "금융 기초",
      difficulty: "easy",
      title: "문제",
      description: "설명",
      correct_answer: "A",
      level: 1,
      explanation: "풀이",
      energy_cost: 1,
      reward_gold: 10,
    },
  });
  mockEq = jest.fn(() => ({ single: mockSingle }));
  mockSelect = jest.fn(() => ({ eq: mockEq }));
  mockSupabaseFrom.mockReturnValue({ select: mockSelect });
}

describe("ProblemPage auth gating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "p1" });
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockSupabaseFrom.mockReset();
    setupProblemQuery();
  });

  it("waits for auth loading to finish before redirecting", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isGuest: false,
      isAuthLoading: true,
    });

    render(<ProblemPage />);

    await waitFor(() => expect(push).not.toHaveBeenCalled());
  });

  it("redirects to /login when unauthenticated after loading", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isGuest: false,
      isAuthLoading: false,
    });

    render(<ProblemPage />);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
  });
});
