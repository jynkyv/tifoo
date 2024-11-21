import { config } from "@/config";

interface StreamResponse {
  content: string;
}

interface GenerateRequest {
  elementCode: string;
  description: string;
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
};
