import { config } from "@/config";

interface StreamResponse {
  content: string;
}

interface GenerateRequest {
  elementCode: string;
  description: string;
}

interface Subscription {
  plan: "free" | "pro" | "enterprise";
  status: string;
  current_period_end?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  role?: string;
  subscription?: {
    plan_id: "free" | "monthly_ai" | "yearly_ai";
    status: string;
    current_period_end: string;
    paddle_subscription_id: string | null;
  };
  created_at: string;
  updated_at: string;
}

export const api = {
  streamGenerate: async function* (
    params: GenerateRequest
  ): AsyncGenerator<string> {
    try {
      const response = await fetch(`${config.apiBaseUrl}/ai/stream`, {
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
      const response = await fetch(`${config.apiBaseUrl}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to fetch user info: ${data.error} - ${data.details || ""}`
        );
      }

      return {
        ...data,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      throw error;
    }
  },
};
