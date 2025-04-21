import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokenState {
  token: string;
  user: any | null;
  setToken: (token: string) => void;
  setUser: (user: any) => void;
  clearAuth: () => void;
}

const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      token: "",
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ token: "", user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useTokenStore;
