import { AuthProvider, useAuth } from "@/lib/context/AuthProvider";
import { render, waitFor } from "@testing-library/react";
import { useEffect, useRef } from "react";

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockSupabase = jest.requireMock("@/lib/supabase/client").supabase as {
  auth: {
    getSession: jest.Mock;
    onAuthStateChange: jest.Mock;
    signInWithPassword: jest.Mock;
    signOut: jest.Mock;
  };
  from: jest.Mock;
};

type Result = { success: true } | { success: false; error: string };

function EmailLoginProbe({
  email,
  password,
  onResult,
}: {
  email: string;
  password: string;
  onResult: (result: Result) => void;
}) {
  const { loginWithEmail } = useAuth();
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    let mounted = true;
    void loginWithEmail(email, password).then((result) => {
      if (mounted) {
        onResult(result);
      }
    });
    return () => {
      mounted = false;
    };
  }, [email, loginWithEmail, onResult, password]);

  return null;
}

describe("AuthProvider loginWithEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it("logs in via Supabase email/password and clears guest flag", async () => {
    window.localStorage.setItem("financely_guest_session", "true");
    window.localStorage.setItem(
      "financely_guest_profile",
      JSON.stringify({ id: "guest" })
    );

    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const results: Result[] = [];

    render(
      <AuthProvider>
        <EmailLoginProbe
          email="user@example.com"
          password="pass1234"
          onResult={(result) => results.push(result)}
        />
      </AuthProvider>
    );

    await waitFor(() => expect(results).toHaveLength(1));

    expect(results[0]).toEqual({ success: true });
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "pass1234",
    });
    expect(window.localStorage.getItem("financely_guest_session")).toBeNull();
  });

  it("returns an error message when Supabase rejects the credentials", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login" },
    });

    const results: Result[] = [];

    render(
      <AuthProvider>
        <EmailLoginProbe
          email="bad@example.com"
          password="wrong"
          onResult={(result) => results.push(result)}
        />
      </AuthProvider>
    );

    await waitFor(() => expect(results).toHaveLength(1));

    expect(results[0]).toEqual({ success: false, error: "Invalid login" });
  });
});
