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
      console.log("开始获取用户信息", {
        url: `${config.apiBaseUrl}/auth/user`,
        tokenLength: token?.length,
        apiBaseUrl: config.apiBaseUrl,
      });

      const response = await fetch(`${config.apiBaseUrl}/auth/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("收到响应:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API 错误:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
          url: `${config.apiBaseUrl}/auth/user`,
        });
        throw new Error(
          `Failed to fetch user info: ${data.error} - ${data.details || ""}`
        );
      }

      console.log("用户信息获取成功:", {
        hasData: !!data,
        fields: Object.keys(data),
      });

      return {
        ...data,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("获取用户信息失败:", {
        error,
        message: error instanceof Error ? error.message : "未知错误",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  },
};
