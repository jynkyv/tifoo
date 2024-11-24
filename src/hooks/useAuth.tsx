import { useState, useEffect, createContext, useContext } from "react";
import { api } from "@/services/api";

interface User {
  id: number;
  email: string;
  role?: string;
  user_role?: string;
  name?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

const AuthContext = createContext<
  { user: User | null; signOut: () => void } | undefined
>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    chrome.storage.local.get("tifoo_token", (result) => {
      console.log("Token retrieved:", result);
      const token = result.tifoo_token;
      if (token) {
        console.log("Token found:", token);
        api
          .fetchUserInfo(token)
          .then((userInfo) => {
            console.log("User info fetched successfully:", userInfo);
            setUser(userInfo);
          })
          .catch(() => {
            console.error("Failed to fetch user info, removing token");
            chrome.storage.local.remove("tifoo_token");
          });
      } else {
        console.log("No token found");
      }
    });
  }, []);

  const signOut = () => {
    chrome.storage.local.remove("tifoo_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
