import { useEffect, useState, createContext, useContext } from "react";
import { api } from "@/services/api";

interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await chrome.storage.local.get(["tifoo_token"]);
        const token = result.tifoo_token;

        if (token) {
          const userInfo = await api.fetchUserInfo(token);
          setUser(userInfo);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
    };

    checkAuth();

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.tifoo_token) {
        checkAuth();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    try {
      await chrome.storage.local.remove(["tifoo_token"]);
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
