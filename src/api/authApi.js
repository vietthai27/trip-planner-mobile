import axiosClient from "./axiosClient";

export const registerApi = async (data) => {
  const res = await axiosClient.post("/auth/register", data);
  return res.data;
};

export const loginApi = async (data) => {
  const res = await axiosClient.post("/auth/login", data);
  return res.data;
};

export const profileApi = async () => {
  const res = await axiosClient.get("/user/profile");
  return res.data;
};
