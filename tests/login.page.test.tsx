import LoginPage from "@/app/login/page";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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

describe("LoginPage guest entry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      replace: jest.fn(),
    });
  });

  it("renders guest CTA button when no user exists", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isGuest: false,
      login: jest.fn(),
      loginAsGuest: jest.fn(),
    });

    render(<LoginPage />);

    expect(screen.getByText("로그인 없이 둘러보기")).toBeInTheDocument();
  });

  it("calls loginAsGuest and redirects to /learn when guest CTA is clicked", async () => {
    const loginAsGuest = jest.fn().mockResolvedValue(undefined);
    const replace = jest.fn();

    mockUseRouter.mockReturnValue({ replace });
    mockUseAuth.mockReturnValue({
      user: null,
      isGuest: false,
      login: jest.fn(),
      loginAsGuest,
    });

    render(<LoginPage />);

    fireEvent.click(screen.getByText("로그인 없이 둘러보기"));

    await waitFor(() => expect(loginAsGuest).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith("/learn");
  });

  it("redirects immediately if already a guest session is active", async () => {
    const replace = jest.fn();

    mockUseRouter.mockReturnValue({ replace });
    mockUseAuth.mockReturnValue({
      user: null,
      isGuest: true,
      login: jest.fn(),
      loginAsGuest: jest.fn(),
    });

    render(<LoginPage />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/learn"));
  });
});
