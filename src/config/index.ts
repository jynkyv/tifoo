const isDev = process.env.NODE_ENV === "development";

export const config = {
  apiBaseUrl: isDev
    ? process.env.PLASMO_PUBLIC_API_TEST_BASE_URL || "http://localhost:6100"
    : process.env.PLASMO_PUBLIC_API_BASE_URL || "https://api.tifoo.co",

  env: isDev ? "development" : "production",
};
