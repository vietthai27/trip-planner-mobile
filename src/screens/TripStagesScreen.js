import React from "react";
import EntityCrudScreen from "./EntityCrudScreen";
import {
  createTripStageApi,
  deleteTripStageApi,
  getTripStageApi,
  listTripStagesApi,
  updateTripStageApi
} from "../api/tripApi";

const config = {
  title: "Trip Stages",
  singular: "Trip Stage",
  subtitle: "Manage itinerary stops, times, locations, and activities.",
  api: {
    list: listTripStagesApi,
    get: getTripStageApi,
    create: createTripStageApi,
    update: updateTripStageApi,
    delete: deleteTripStageApi
  },
  fields: [
    { name: "name", label: "Name", defaultValue: "First stop" },
    { name: "startTime", label: "Start Time", defaultValue: "2026-06-01T08:00:00" },
    { name: "endTime", label: "End Time", defaultValue: "2026-06-01T12:00:00" },
    { name: "location", label: "Location", defaultValue: "Nha Trang" },
    { name: "activity", label: "Activity", defaultValue: "Lunch and sightseeing", multiline: true },
    { name: "tripId", label: "Trip ID", type: "number", defaultValue: "1" }
  ],
  getTitle: (stage) => `${stage?.name || "Unnamed Stage"}${stage?.id ? ` #${stage.id}` : ""}`,
  getDetails: (stage) => [
    `Trip ID: ${stage?.tripId ?? stage?.trip?.id ?? "-"}`,
    `Location: ${stage?.location || "-"}`,
    `Time: ${stage?.startTime || "-"} to ${stage?.endTime || "-"}`,
    `Activity: ${stage?.activity || "-"}`
  ]
};

export default function TripStagesScreen() {
  return <EntityCrudScreen config={config} />;
}
