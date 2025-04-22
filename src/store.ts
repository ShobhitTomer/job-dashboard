import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/http/api";

interface User {
  id: string;
  email: string;
  role: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  [key: string]: any;
}

interface TokenState {
  token: string;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
  refreshUserRole: () => Promise<void>;
}

const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      token: "",
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: "", user: null }),
      isAdmin: () => get().user?.role === "admin",
      refreshUserRole: async () => {
        try {
          // Get the current user
          const { data: authData } = await supabase.auth.getUser();

          if (!authData?.user) return;

          // Get user role from users table
          const { data: userData, error } = await supabase
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .single();

          if (error) {
            console.error("Error fetching user role:", error);
            return;
          }

          if (userData && get().user) {
            // Update only the role while preserving other user data
            set({
              user: {
                ...get().user,
                role: userData.role,
              },
            });
          }
        } catch (error) {
          console.error("Error refreshing user role:", error);
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useTokenStore;
