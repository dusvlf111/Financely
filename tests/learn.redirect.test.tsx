import LearnPage from "@/app/learn/page";
import { render, waitFor } from "@testing-library/react";

jest.mock("@/lib/context/AuthProvider", () => ({
  useAuth: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = jest.requireMock("@/lib/context/AuthProvider")
  .useAuth as jest.Mock;
const mockUseRouter = jest.requireMock("next/navigation")
  .useRouter as jest.Mock;

describe("LearnPage auth gating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn(() => Promise.resolve()) });
  });

  it("does not redirect while auth state is still loading", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isGuest: false,
      isAuthLoading: true,
    });

    render(<LearnPage />);

    await waitFor(() => expect(push).not.toHaveBeenCalled());
  });

  it("redirects to /login once loading finishes with no session", async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });

    mockUseAuth.mockReturnValue({
      user: null,
      profile: null,
      isGuest: false,
      isAuthLoading: false,
    });

    render(<LearnPage />);

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"));
  });
});
