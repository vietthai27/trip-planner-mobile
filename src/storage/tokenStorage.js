import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "access_token";

export const saveToken = async (token) => {
  if (typeof token !== "string" || token.trim() === "") {
    throw new Error("Missing auth token");
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  // Ensure we return null for falsy values, not empty strings
  return token || null;
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
