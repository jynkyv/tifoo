import React, { useEffect, useState } from "react";
import "@/styles";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const IndexPopup = () => {
  const [isActive, setIsActive] = useState(false);
  const { user, signOut } = useAuth();

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

  return (
    <div data-tifoo-ext>
      <div className="w-80">
        <div className="bg-[#1DA1F2] text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className={`font-caprasimo text-xl`}>tifoo</span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${isActive ? "bg-green-400" : "bg-gray-400"}`}
            ></span>
            <span className="text-sm font-mono">
              {isActive ? "Active" : ""}
            </span>
          </div>
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
          {!user ? (
            <button
              className="w-full py-2 px-4 rounded-full bg-blue-500 text-white font-medium transition-all duration-300 hover:bg-blue-600"
              onClick={() =>
                window.open("http://localhost:3000/login", "_blank")
              }
            >
              Sign In / Sign Up
            </button>
          ) : (
            <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="h-9 w-9 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-medium">{user.email}</span>
                  <span className="block text-xs text-gray-400">Free Plan</span>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-2 text-red-600"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        <div className="bg-[#E8F5FE] p-3 flex justify-end text-xs text-[#657786]">
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
