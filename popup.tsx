import React, { useEffect, useState } from "react";
import "@/styles";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import PlanIcon from "@/components/icons/PlanIcon";
import type { User } from "@/services/api";
import { LoadingSpinner } from "@/components/icons/LoadingSpiner";
const truncateEmail = (email: string) => {
  const [username] = email.split("@");
  if (username.length <= 6) return username;
  return `${username.slice(0, 6)}...`;
};

const getAvatarText = (email: string) => {
  const [username] = email.split("@");
  if (username.length === 1) return username.toUpperCase();
  return username.slice(0, 2).toUpperCase();
};

const UserAvatar = ({ user, signOut }: { user: User; signOut: any }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex items-center space-x-2 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden min-w-[120px] flex items-center justify-end">
        <span
          className={`flex items-center transition-transform duration-300 ${
            isHovered
              ? "-translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <div className="h-7 w-7 bg-white text-[#1DA1F2] flex items-center justify-center rounded-full text-sm font-medium mr-2">
            {getAvatarText(user.email)}
          </div>
          <span className="truncate text-sm text-white">
            {truncateEmail(user.email)}
          </span>
        </span>
        <span
          className={`absolute right-0 top-0 text-sm text-white transition-transform duration-300 ${
            isHovered
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0"
          }`}
          onClick={signOut}
        >
          Sign Out
        </span>
      </div>
    </div>
  );
};

const IndexPopup = () => {
  const [isActive, setIsActive] = useState(false);
  const { user, signOut, isLoading, refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const sendMessageToActiveTab = async (message: any) => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      return chrome.tabs.sendMessage(tab.id, message);
    }
  };

  useEffect(() => {
    const initState = async () => {
      try {
        const response = await sendMessageToActiveTab({ action: "getState" });
        if (response?.isActive !== undefined) {
          setIsActive(response.isActive);
        }
      } catch (error) {
        console.error("Failed to get initial state:", error);
      }
    };

    initState();
  }, []);

  const handleToggle = async () => {
    try {
      const newState = !isActive;
      await sendMessageToActiveTab({
        action: "toggleTifoo",
        isActive: newState,
      });
      setIsActive(newState);
      setTimeout(() => {
        window.close();
      }, 500);
    } catch (error) {
      console.error("Failed to toggle state:", error);
    }
  };

  const handleRefreshAuth = async () => {
    setIsRefreshing(true);
    try {
      const result = await chrome.storage.local.get(["tifoo_token"]);
      
      // Use new refreshUser method
      await refreshUser();
    } catch (error) {
      console.error("Failed to refresh auth status:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Only show loading on initial load when no cached user info
  const showInitialLoading = isLoading && !user;

  return (
    <div data-tifoo-ext>
      <div className="w-80">
        <div className="bg-[#1DA1F2] text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`font-caprasimo text-xl`}>tifoo</span>
          </div>
          {!user ? (
            <div className="flex items-center space-x-2">
              <button
                className="px-2 py-1 rounded bg-white/20 text-white text-xs hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
                onClick={handleRefreshAuth}
                disabled={isRefreshing}
                title="刷新认证状态"
              >
                {isRefreshing ? <LoadingSpinner /> : "刷新"}
              </button>
              <button
                className="px-3 py-1 rounded-full bg-white text-[#1DA1F2] text-sm font-medium hover:bg-opacity-90 transition-all duration-300"
                onClick={() =>
                  window.open("http://localhost:3000/signin", "_blank")
                }
              >
                {showInitialLoading ? <LoadingSpinner /> : "Sign In"}
              </button>
            </div>
          ) : (
            <UserAvatar user={user} signOut={signOut} />
          )}
        </div>
        <div className="p-4 space-y-4">
          <p className="text-[#657786] text-sm font-mono text-center">
            Effortless Tailwind Stylings, Now!
          </p>
          <button
            className={`w-full py-2 px-4 rounded-full text-white font-medium transition-all duration-300 ${
              isActive
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#1DA1F2] hover:bg-[#0C7ABF]"
            } hover:shadow-md transform hover:-translate-y-0.5`}
            onClick={handleToggle}
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
        <div className="bg-[#E8F5FE] p-3 flex justify-between items-center text-xs text-[#657786]">
          {user && (
            <span className="flex items-center gap-2">
              <PlanIcon type={user.subscription?.plan_id || "free"} />
              {user.subscription?.plan_id === "monthly_ai" ||
              user.subscription?.plan_id === "yearly_ai"
                ? "AI Assistant"
                : "Free Plan"}
            </span>
          )}
          <a
            href={process.env.PLASMO_PUBLIC_GITHUB_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1DA1F2] transition-colors duration-300"
          >
            Report an issue
          </a>
        </div>
      </div>
    </div>
  );
};

const Popup = () => {
  return (
    <AuthProvider>
      <IndexPopup />
    </AuthProvider>
  );
};

export default Popup;
