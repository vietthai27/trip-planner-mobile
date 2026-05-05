import React from "react";
import EntityCrudScreen, { getUserId } from "./EntityCrudScreen";
import {
  createTripApi,
  deleteTripApi,
  getTripApi,
  listTripsApi,
  updateTripApi
} from "../api/tripApi";

const config = {
  title: "Trips",
  singular: "Trip",
  subtitle: "Manage trip plans, budgets, route endpoints, and assigned users.",
  api: {
    list: listTripsApi,
    get: getTripApi,
    create: createTripApi,
    update: updateTripApi,
    delete: deleteTripApi
  },
  fields: [
    { name: "title", label: "Title", defaultValue: "Da Nang Trip" },
    { name: "status", label: "Status", defaultValue: "PLANNING" },
    { name: "budget", label: "Budget", type: "number", defaultValue: "5000000" },
    { name: "startLocation", label: "Start Location", defaultValue: "Ho Chi Minh City" },
    { name: "endLocation", label: "End Location", defaultValue: "Da Nang" },
    { name: "startTime", label: "Start Time", defaultValue: "2026-06-01T08:00:00" },
    { name: "distance", label: "Distance", type: "number", defaultValue: "850" },
    { name: "userIds", label: "User IDs", type: "numberArray", defaultValue: (user) => getUserId(user) || "1" }
  ],
  getTitle: (trip) => `${trip?.title || "Untitled Trip"}${trip?.id ? ` #${trip.id}` : ""}`,
  getDetails: (trip) => [
    `Status: ${trip?.status || "-"}`,
    `Route: ${trip?.startLocation || "-"} to ${trip?.endLocation || "-"}`,
    `Budget: ${trip?.budget ?? "-"}`,
    `Start: ${trip?.startTime || "-"}`
  ]
};

export default function TripsScreen() {
  return <EntityCrudScreen config={config} />;
}
