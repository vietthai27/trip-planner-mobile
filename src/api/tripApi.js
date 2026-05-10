import axiosClient from "./axiosClient";

const unwrap = (response) => response.data;

export const listTripsApi = async () => unwrap(await axiosClient.get("/trips"));
export const listMyTripsApi = async () => unwrap(await axiosClient.get("/trips/me"));
export const listTripSelectableUsersApi = async () => unwrap(await axiosClient.get("/trips/users"));
export const listTripUsersApi = async (tripId) => unwrap(await axiosClient.get(`/trips/${tripId}/users`));
export const getTripApi = async (id) => unwrap(await axiosClient.get(`/trips/${id}`));
export const createTripApi = async (data) => unwrap(await axiosClient.post("/trips", data));
export const updateTripApi = async (id, data) => unwrap(await axiosClient.put(`/trips/${id}`, data));
export const deleteTripApi = async (id) => unwrap(await axiosClient.delete(`/trips/${id}`));

export const listTripStagesApi = async () => unwrap(await axiosClient.get("/trip-stages"));
export const listTripStagesByTripApi = async (tripId) => unwrap(await axiosClient.get(`/trip-stages/trips/${tripId}`));
export const getTripStageApi = async (id) => unwrap(await axiosClient.get(`/trip-stages/${id}`));
export const createTripStageApi = async (data) => unwrap(await axiosClient.post("/trip-stages", data));
export const updateTripStageApi = async (id, data) => unwrap(await axiosClient.put(`/trip-stages/${id}`, data));
export const deleteTripStageApi = async (id) => unwrap(await axiosClient.delete(`/trip-stages/${id}`));

export const listTripSpendingsApi = async () => unwrap(await axiosClient.get("/trip-spendings"));
export const listTripSpendingTypesApi = async () => unwrap(await axiosClient.get("/trip-spendings/types"));
export const listTripSpendingsWithoutStageApi = async (tripId) =>
  unwrap(await axiosClient.get(`/trip-spendings/trips/${tripId}/without-stage`));
export const listTripSpendingsByStageApi = async (stageId) =>
  unwrap(await axiosClient.get(`/trip-spendings/stages/${stageId}`));
export const getTripSpendingApi = async (id) => unwrap(await axiosClient.get(`/trip-spendings/${id}`));
export const createTripSpendingApi = async (data) => unwrap(await axiosClient.post("/trip-spendings", data));
export const updateTripSpendingApi = async (id, data) => unwrap(await axiosClient.put(`/trip-spendings/${id}`, data));
export const deleteTripSpendingApi = async (id) => unwrap(await axiosClient.delete(`/trip-spendings/${id}`));
export const getTripSpendingSummaryApi = async (tripId) =>
  unwrap(await axiosClient.get(`/trip-spendings/trips/${tripId}/summary`));
