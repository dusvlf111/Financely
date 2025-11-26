"use client";
import { useGoldStore } from "@/lib/store/goldStore";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

const GUEST_PROFILE_STORAGE_KEY = "financely_guest_profile";
const GUEST_SESSION_FLAG_KEY = "financely_guest_session";

const createGuestProfile = (): Profile => ({
  id: "guest",
  username: "게스트",
  full_name: "게스트",
  avatar_url: null,
  gold: 500,
  energy: 5,
  level: 1,
  xp: 0,
  streak: 0,
  tutorialCompleted: false,
});

const loadGuestProfile = (): Profile | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(GUEST_PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
};

const persistGuestProfile = (profile: Profile) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    GUEST_PROFILE_STORAGE_KEY,
    JSON.stringify(profile)
  );
};

const markGuestSession = (isActive: boolean) => {
  if (typeof window === "undefined") return;
  if (isActive) {
    window.localStorage.setItem(GUEST_SESSION_FLAG_KEY, "true");
  } else {
    window.localStorage.removeItem(GUEST_SESSION_FLAG_KEY);
  }
};

export type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  gold: number;
  energy: number;
  level: number;
  xp: number;
  streak: number;
  tutorialCompleted?: boolean;
};

type DbProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  gold: number | null;
  energy: number | null;
  level: number | null;
  xp: number | null;
  streak: number | null;
  tutorial_completed: boolean | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  login: (provider: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  isGuest: boolean;
  isAuthLoading: boolean;
  addGold?: (amount: number) => Promise<void>;
  updateProfile?: (changes: Partial<Profile>) => Promise<void>;
  addXp?: (amount: number) => Promise<void>;
  streak: number;
  incrementStreak: () => Promise<void>;
  resetStreak: () => Promise<void>;
  trackQuestProgress?: (questType: string) => Promise<void>;
  spendGold?: (amount: number) => Promise<boolean>;
  completeTutorial?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const formatProfile = (data: DbProfileRow): Profile => ({
      id: data.id,
      username: data.username,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      gold: data.gold ?? 0,
      energy: data.energy ?? 0,
      level: data.level ?? 1,
      xp: data.xp ?? 0,
      streak: data.streak ?? 0,
      tutorialCompleted: data.tutorial_completed ?? false,
    });

    const restoreGuestProfileIfAvailable = () => {
      if (typeof window === "undefined") return null;
      const hasGuestSession =
        window.localStorage.getItem(GUEST_SESSION_FLAG_KEY) === "true";
      if (!hasGuestSession) return null;
      const storedProfile = loadGuestProfile() ?? createGuestProfile();
      persistGuestProfile(storedProfile);
      return storedProfile;
    };

    const fetchProfile = async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data ? formatProfile(data as DbProfileRow) : null;
    };

    const syncSessionState = async (nextUser: User | null) => {
      if (!isMounted) return;
      setIsAuthLoading(true);

      try {
        setUser(nextUser);

        if (nextUser) {
          setIsGuest(false);
          markGuestSession(false);
          const dbProfile = await fetchProfile(nextUser.id);
          if (!isMounted) return;
          setProfile(dbProfile);
        } else {
          const guestProfile = restoreGuestProfileIfAvailable();
          if (!isMounted) return;
          if (guestProfile) {
            setProfile(guestProfile);
            setIsGuest(true);
            markGuestSession(true);
          } else {
            setProfile(null);
            setIsGuest(false);
          }
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    const bootstrap = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!isMounted) return;
      await syncSessionState(session?.user ?? null);
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSessionState(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Gold history is now automatically tracked by database trigger
  // No need for manual sync here

  async function login(provider: string) {
    if (isGuest) {
      markGuestSession(false);
      setIsGuest(false);
    }
    await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "kakao",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  async function loginAsGuest() {
    if (user) {
      await supabase.auth.signOut();
    }
    const guestProfile = loadGuestProfile() ?? createGuestProfile();
    setUser(null);
    setProfile(guestProfile);
    setIsGuest(true);
    markGuestSession(true);
    persistGuestProfile(guestProfile);
  }

  async function logout() {
    if (isGuest) {
      setIsGuest(false);
      setProfile(null);
      markGuestSession(false);
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function addGold(amount: number) {
    if (isGuest) {
      setProfile((prev) => {
        if (!prev) return prev;
        const nextGold = prev.gold + amount;
        const next = { ...prev, gold: nextGold };
        persistGuestProfile(next);
        const { addGoldEntry } = useGoldStore.getState();
        addGoldEntry(null, nextGold);
        return next;
      });
      return;
    }
    if (!user || !profile) return;
    const newGold = profile.gold + amount;
    const { data } = await supabase
      .from("profiles")
      .update({ gold: newGold })
      .eq("id", user.id)
      .select()
      .single();
    if (data) {
      const formattedProfile: Profile = {
        ...data,
        full_name: data.full_name,
        username: data.username,
        gold: data.gold,
        level: data.level,
        xp: data.xp,
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      };
      setProfile(formattedProfile);
      const { addGoldEntry } = useGoldStore.getState();
      await addGoldEntry(user.id, data.gold);
    }
  }

  async function spendGold(amount: number) {
    if (isGuest) {
      if (!profile || profile.gold < amount) return false;
      setProfile((prev) => {
        if (!prev) return prev;
        const nextGold = prev.gold - amount;
        const next = { ...prev, gold: nextGold };
        persistGuestProfile(next);
        const { addGoldEntry } = useGoldStore.getState();
        addGoldEntry(null, nextGold);
        return next;
      });
      return true;
    }
    if (!user || !profile || profile.gold < amount) return false;
    const newGold = profile.gold - amount;
    const { data } = await supabase
      .from("profiles")
      .update({ gold: newGold })
      .eq("id", user.id)
      .select()
      .single();
    if (data) {
      const formattedProfile: Profile = {
        ...data,
        full_name: data.full_name,
        username: data.username,
        gold: data.gold,
        level: data.level,
        xp: data.xp,
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      };
      setProfile(formattedProfile);
      const { addGoldEntry } = useGoldStore.getState();
      await addGoldEntry(user.id, data.gold);
      return true;
    }
    return false;
  }

  async function updateProfile(changes: Partial<Profile>) {
    if (isGuest) {
      setProfile((prev) => {
        if (!prev) return prev;
        const next: Profile = { ...prev, ...changes };
        persistGuestProfile(next);
        return next;
      });
      return;
    }
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .update(changes)
      .eq("id", user.id)
      .select()
      .single();
    if (data) {
      const formattedProfile: Profile = {
        ...data,
        full_name: data.full_name,
        username: data.username,
        gold: data.gold,
        level: data.level,
        xp: data.xp,
        avatar_url: data.avatar_url,
        tutorialCompleted: data.tutorial_completed,
      };
      setProfile(formattedProfile);
    }
  }

  async function completeTutorial() {
    if (isGuest) {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, tutorialCompleted: true };
        persistGuestProfile(next);
        return next;
      });
      return;
    }
    if (!user) return;
    await updateProfile({ tutorialCompleted: true });
  }

  async function trackQuestProgress(questType: string) {
    if (!user) return;

    try {
      const { error } = await supabase.rpc("update_quest_progress", {
        quest_type: questType,
        user_id: user.id,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error tracking quest progress:", error);
    }
  }

  const incrementStreak = async () => {
    if (isGuest) {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, streak: prev.streak + 1 };
        persistGuestProfile(next);
        return next;
      });
      return;
    }
    if (!user || !profile) return;
    const newStreak = profile.streak + 1;
    setProfile((p) => (p ? { ...p, streak: newStreak } : null)); // Optimistic update
    await supabase
      .from("profiles")
      .update({ streak: newStreak })
      .eq("id", user.id);
  };

  const resetStreak = async () => {
    if (isGuest) {
      setProfile((prev) => {
        if (!prev) return prev;
        const next = { ...prev, streak: 0 };
        persistGuestProfile(next);
        return next;
      });
      return;
    }
    if (!user || !profile) return;
    setProfile((p) => (p ? { ...p, streak: 0 } : null)); // Optimistic update
    await supabase.from("profiles").update({ streak: 0 }).eq("id", user.id);
  };

  const addXp = async (amount: number) => {
    if (isGuest) {
      setProfile((prev) => {
        if (!prev) return prev;
        const xpForNextLevel = prev.level * 100;
        const newXp = prev.xp + amount;
        let newLevel = prev.level;
        let finalXp = newXp;
        if (newXp >= xpForNextLevel) {
          newLevel += 1;
          finalXp = newXp - xpForNextLevel;
        }
        const next = { ...prev, level: newLevel, xp: finalXp };
        persistGuestProfile(next);
        return next;
      });
      return;
    }
    if (!user || !profile) return;

    const xpForNextLevel = profile.level * 100; // 다음 레벨업에 필요한 경험치 (예: 레벨 1 -> 100XP, 레벨 2 -> 200XP)
    const newXp = profile.xp + amount;

    let newLevel = profile.level;
    let finalXp = newXp;

    if (newXp >= xpForNextLevel) {
      newLevel += 1;
      finalXp = newXp - xpForNextLevel;
      // TODO: 레벨업 축하 모달 또는 애니메이션 표시
    }

    // Optimistic UI update
    setProfile((p) => (p ? { ...p, level: newLevel, xp: finalXp } : null));

    // DB update
    await supabase
      .from("profiles")
      .update({ level: newLevel, xp: finalXp })
      .eq("id", user.id);
  };

  const value = {
    user,
    profile,
    login,
    logout,
    loginAsGuest,
    isGuest,
    isAuthLoading,
    addGold,
    addXp,
    updateProfile,
    spendGold,
    completeTutorial,
    trackQuestProgress,
    streak: profile?.streak ?? 0,
    incrementStreak,
    resetStreak,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthProvider;
