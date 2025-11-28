import { AuthProvider, useAuth } from "@/lib/context/AuthProvider";
import { render, waitFor } from "@testing-library/react";
import { useEffect } from "react";

jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: jest.fn(),
    rpc: jest.fn(),
  },
}));

const mockSupabase = jest.requireMock("@/lib/supabase/client").supabase as {
  auth: {
    getSession: jest.Mock;
    onAuthStateChange: jest.Mock;
  };
  from: jest.Mock;
  rpc: jest.Mock;
};

type Snapshot = {
  isAuthLoading: boolean;
  isGuest: boolean;
  user: unknown;
  profile: unknown;
};

function AuthStateProbe({
  onSnapshot,
}: {
  onSnapshot: (state: Snapshot) => void;
}) {
  const { isAuthLoading, isGuest, user, profile } = useAuth();

  useEffect(() => {
    onSnapshot({ isAuthLoading, isGuest, user, profile });
  }, [isAuthLoading, isGuest, onSnapshot, profile, user]);

  return null;
}

const getSessionMock = () => mockSupabase.auth.getSession as jest.Mock;
const onAuthStateChangeMock = () =>
  mockSupabase.auth.onAuthStateChange as jest.Mock;
const fromMock = () => mockSupabase.from as jest.Mock;

const baseProfileRow = {
  id: "user-1",
  username: "tester",
  full_name: "테스터",
  avatar_url: null,
  gold: 100,
  energy: 3,
  level: 1,
  xp: 0,
  streak: 0,
  tutorial_completed: false,
};

describe("AuthProvider loading state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    mockSupabase.auth.getSession.mockReset();
    mockSupabase.auth.onAuthStateChange.mockReset();
    mockSupabase.from.mockReset();
    mockSupabase.rpc.mockReset();

    getSessionMock().mockResolvedValue({ data: { session: null } });
    onAuthStateChangeMock().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    });
  });

  it("emits loading=true initially then flips to false once session resolves", async () => {
    const snapshots: Snapshot[] = [];

    render(
      <AuthProvider>
        <AuthStateProbe onSnapshot={(state) => snapshots.push(state)} />
      </AuthProvider>
    );

    await waitFor(() => expect(snapshots.length).toBeGreaterThan(0));

    expect(snapshots[0].isAuthLoading).toBe(true);
    await waitFor(() => {
      const latest = snapshots[snapshots.length - 1];
      expect(latest.isAuthLoading).toBe(false);
    });
  });

  it("restores guest session data when localStorage marks an active guest", async () => {
    const guestProfile = {
      id: "guest",
      username: "게스트",
      full_name: "게스트",
      avatar_url: null,
      gold: 500,
      energy: 5,
      level: 1,
      xp: 0,
      streak: 0,
      tutorial_completed: false,
    };

    window.localStorage.setItem("financely_guest_session", "true");
    window.localStorage.setItem(
      "financely_guest_profile",
      JSON.stringify(guestProfile)
    );

    const snapshots: Snapshot[] = [];

    render(
      <AuthProvider>
        <AuthStateProbe onSnapshot={(state) => snapshots.push(state)} />
      </AuthProvider>
    );

    await waitFor(() => expect(snapshots.length).toBeGreaterThan(0));

    await waitFor(() => {
      const finalSnapshot = snapshots[snapshots.length - 1];
      expect(finalSnapshot.isAuthLoading).toBe(false);
      expect(finalSnapshot.isGuest).toBe(true);
      expect(finalSnapshot.profile).toMatchObject({ id: "guest", gold: 500 });
    });
  });

  it("fetches profile rows for authenticated users", async () => {
    const single = jest.fn().mockResolvedValue({ data: baseProfileRow });
    const eq = jest.fn(() => ({ single }));
    const select = jest.fn(() => ({ eq }));
    fromMock().mockReturnValue({ select });

    getSessionMock().mockResolvedValue({
      data: {
        session: {
          user: { id: "user-1" },
        },
      },
    });

    const snapshots: Snapshot[] = [];

    render(
      <AuthProvider>
        <AuthStateProbe onSnapshot={(state) => snapshots.push(state)} />
      </AuthProvider>
    );

    await waitFor(() => expect(single).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(snapshots.length).toBeGreaterThan(0));
    const finalSnapshot = snapshots[snapshots.length - 1];

    expect(finalSnapshot.isGuest).toBe(false);
    expect(finalSnapshot.user).toEqual(
      expect.objectContaining({ id: "user-1" })
    );
    expect(finalSnapshot.profile).toMatchObject({ id: "user-1", gold: 100 });
  });
});
