import { AuthProvider, useAuth } from "@/lib/context/AuthProvider";
import { render, waitFor } from "@testing-library/react";
import { useEffect, useRef } from "react";

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      signUp: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockSupabase = jest.requireMock("@/lib/supabase/client").supabase as {
  auth: {
    getSession: jest.Mock;
    onAuthStateChange: jest.Mock;
    signUp: jest.Mock;
  };
  from: jest.Mock;
};

type SignupResult =
  | { success: true; requiresEmailConfirmation: boolean }
  | { success: false; error: string };

function SignupProbe({
  email,
  password,
  onResult,
}: {
  email: string;
  password: string;
  onResult: (result: SignupResult) => void;
}) {
  const { signUpWithEmail } = useAuth();
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    let mounted = true;
    void signUpWithEmail(email, password).then((result) => {
      if (mounted) {
        onResult(result);
      }
    });
    return () => {
      mounted = false;
    };
  }, [email, onResult, password, signUpWithEmail]);

  return null;
}

describe("AuthProvider signUpWithEmail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
  });

  it("creates user and initial profile, returns success", async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    mockSupabase.from.mockReturnValue({ upsert });

    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: "user-123", email: "new@example.com" },
        session: { user: { id: "user-123" } },
      },
      error: null,
    });

    const results: SignupResult[] = [];

    render(
      <AuthProvider>
        <SignupProbe
          email="new@example.com"
          password="pass1234"
          onResult={(result) => results.push(result)}
        />
      </AuthProvider>
    );

    await waitFor(() => expect(results).toHaveLength(1));

    expect(results[0]).toEqual({
      success: true,
      requiresEmailConfirmation: false,
    });
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "new@example.com",
        password: "pass1234",
        options: expect.objectContaining({
          data: expect.objectContaining({
            username: "new",
            full_name: "new@example.com",
          }),
        }),
      })
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-123", username: "new" }),
      { onConflict: "id" }
    );
  });

  it("returns error when Supabase signUp fails", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Email already registered" },
    });

    const results: SignupResult[] = [];

    render(
      <AuthProvider>
        <SignupProbe
          email="dup@example.com"
          password="pass1234"
          onResult={(result) => results.push(result)}
        />
      </AuthProvider>
    );

    await waitFor(() => expect(results).toHaveLength(1));

    expect(results[0]).toEqual({
      success: false,
      error: "Email already registered",
    });
  });
});
