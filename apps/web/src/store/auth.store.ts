import { useState, useCallback } from "react";
import type { User } from "../Domain/User";

interface AuthStore {
  token: string | null;
  setToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User) => void;
}

export function useAuthStore(): AuthStore {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });
  const [user, setUserState] = useState<User | null>(() => {
    const data = localStorage.getItem("authUser");
    if (!data) return null;
    return JSON.parse(data, (data: any) => ({
      uuid: data.id,
      username: data.name,
      email: data.email,
    }));
  });

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
  }, []);

  const setUser = useCallback((user: User) => {
    setUserState(user);
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, []);

  return {
    token,
    setToken,
    user,
    setUser,
  };
}
