import { config } from "@/config";

interface StreamResponse {
  content: string;
}

interface GenerateRequest {
  elementCode: string;
  description: string;
}

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

export const api = {
  streamGenerate: async function* (
    params: GenerateRequest
  ): AsyncGenerator<string> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/ai/generate/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          elementCode: params.elementCode,
          description: params.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        yield text;
      }
    } catch (error) {
      console.error("Failed to generate stream:", error);
      throw error;
    }
  },

  fetchUserInfo: async (token: string): Promise<User> => {
    try {
      console.log("Fetching user info with token:", token);
      const response = await fetch(`${config.apiBaseUrl}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.error("API Error:", {
          status: response.status,
          statusText: response.statusText,
        });

        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);

        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const data = await response.json();
      console.log("User info fetched successfully:", data);
      return data.data;
    } catch (error) {
      console.error("Error in fetchUserInfo:", error);
      throw error;
    }
  },
};
