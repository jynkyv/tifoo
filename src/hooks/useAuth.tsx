import { useEffect, useState, createContext, useContext } from "react";
import { api, type User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  signOut: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  signOut: () => {},
  isLoading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  const checkAuth = async (forceRefresh = false) => {
    try {
      const result = await chrome.storage.local.get(["tifoo_token", "cached_user", "user_cache_time"]);
      const token = result.tifoo_token;
      const cachedUser = result.cached_user;
      const cacheTime = result.user_cache_time || 0;

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Use cached user info if available and not expired
      if (cachedUser && !forceRefresh && (Date.now() - cacheTime < CACHE_DURATION)) {
        setUser(cachedUser);
        setIsLoading(false);
        
        // Silently update user info in background
        refreshUserInBackground(token);
        return;
      }

      // Force refresh or cache expired, fetch user info
      const userInfo = await api.fetchUserInfo(token);
      
      // Update cache
      await chrome.storage.local.set({
        cached_user: userInfo,
        user_cache_time: Date.now(),
      });
      
      setUser(userInfo);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserInBackground = async (token: string) => {
    try {
      const userInfo = await api.fetchUserInfo(token);
      
      // Update cache and state
      await chrome.storage.local.set({
        cached_user: userInfo,
        user_cache_time: Date.now(),
      });
      
      setUser(userInfo);
    } catch (error) {
      // Background update failure doesn't affect current state
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    await checkAuth(true);
  };

  useEffect(() => {
    checkAuth();

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.tifoo_token) {
        // Clear cache when token changes
        if (changes.tifoo_token.newValue) {
          chrome.storage.local.remove(["cached_user", "user_cache_time"]);
        }
        
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
      await chrome.storage.local.remove(["tifoo_token", "cached_user", "user_cache_time"]);
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signOut, isLoading, refreshUser }}>
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
