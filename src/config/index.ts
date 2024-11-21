const isDev = process.env.NODE_ENV === "development";

export const config = {
  apiBaseUrl: isDev
    ? "http://localhost:3000"
    : process.env.PLASMO_PUBLIC_API_BASE_URL || "https://api.tifoo.co",

  env: isDev ? "development" : "production",
};
