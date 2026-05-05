import React, { useState } from "react";
import { View } from "react-native";
import { Button, Card, Text, TextInput } from "react-native-paper";
import EntityCrudScreen, { getUserId } from "./EntityCrudScreen";
import {
  createTripSpendingApi,
  deleteTripSpendingApi,
  getTripSpendingApi,
  getTripSpendingSummaryApi,
  listTripSpendingsApi,
  updateTripSpendingApi
} from "../api/tripApi";

const SummaryTool = ({ isBusy, setError }) => {
  const [tripId, setTripId] = useState("1");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSummary = async () => {
    if (!tripId.trim()) {
      setError("Enter a Trip ID to load spending summary.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getTripSpendingSummaryApi(tripId.trim());
      setSummary(response?.data ?? response);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Could not load summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <Card.Content>
        <Text variant="titleMedium">Trip Spending Summary</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
          <TextInput
            label="Trip ID"
            value={tripId}
            onChangeText={setTripId}
            mode="outlined"
            keyboardType="numeric"
            style={{ flex: 1 }}
          />
          <Button
            mode="contained-tonal"
            onPress={loadSummary}
            loading={loading}
            disabled={isBusy || loading}
            style={{ alignSelf: "center" }}
          >
            Summary
          </Button>
        </View>
        {summary ? (
          <Text style={{ marginTop: 12, color: "#59616d" }}>{JSON.stringify(summary, null, 2)}</Text>
        ) : null}
      </Card.Content>
    </Card>
  );
};

const config = {
  title: "Trip Spendings",
  singular: "Trip Spending",
  subtitle: "Manage trip expenses, payer, stage, type, and included users.",
  api: {
    list: listTripSpendingsApi,
    get: getTripSpendingApi,
    create: createTripSpendingApi,
    update: updateTripSpendingApi,
    delete: deleteTripSpendingApi
  },
  fields: [
    { name: "name", label: "Name", defaultValue: "Fuel" },
    { name: "amount", label: "Amount", type: "number", defaultValue: "500000" },
    { name: "userId", label: "User ID", type: "number", defaultValue: (user) => getUserId(user) || "1" },
    { name: "tripId", label: "Trip ID", type: "number", defaultValue: "1" },
    { name: "tripStageId", label: "Trip Stage ID", type: "number", defaultValue: "1" },
    { name: "tripSpendingType", label: "Spending Type", defaultValue: "VEHICLE" },
    { name: "includedUserIds", label: "Included User IDs", type: "numberArray", defaultValue: (user) => getUserId(user) || "1" }
  ],
  renderExtra: (props) => <SummaryTool {...props} />,
  getTitle: (spending) => `${spending?.name || "Unnamed Spending"}${spending?.id ? ` #${spending.id}` : ""}`,
  getDetails: (spending) => [
    `Amount: ${spending?.amount ?? "-"}`,
    `Type: ${spending?.tripSpendingType || "-"}`,
    `Trip ID: ${spending?.tripId ?? spending?.trip?.id ?? "-"}`,
    `Stage ID: ${spending?.tripStageId ?? spending?.tripStage?.id ?? "-"}`
  ]
};

export default function TripSpendingsScreen() {
  return <EntityCrudScreen config={config} />;
}
