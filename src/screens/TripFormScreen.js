import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { useSelector } from "react-redux";
import { createTripApi, getTripApi, updateTripApi } from "../api/tripApi";

const createEmptyForm = (userId) => ({
  title: "",
  status: "PLANNING",
  budget: "",
  startLocation: "",
  endLocation: "",
  startTime: "",
  distance: "",
  userIds: userId != null ? String(userId) : ""
});

const getEntity = (response) => {
  if (response?.data && typeof response.data === "object" && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

const toInputValue = (value) => (value == null ? "" : String(value));

const getTripUserIds = (trip, fallbackUserId) => {
  if (Array.isArray(trip?.users) && trip.users.length > 0) {
    return trip.users.map((user) => user?.id).filter((id) => id != null).join(", ");
  }

  if (Array.isArray(trip?.userIds) && trip.userIds.length > 0) {
    return trip.userIds.join(", ");
  }

  return fallbackUserId != null ? String(fallbackUserId) : "";
};

const parseNumber = (value) => {
  const trimmed = String(value ?? "").trim();
  return trimmed === "" ? null : Number(trimmed);
};

const parseNumberArray = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number);

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || "Request failed.";

export default function TripFormScreen({ navigation, route }) {
  const user = useSelector((state) => state.auth.user);
  const tripId = route?.params?.tripId;
  const isEditing = tripId != null;
  const initialForm = useMemo(() => createEmptyForm(user?.id), [user?.id]);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEditing) {
      setForm(initialForm);
    }
  }, [initialForm, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    let active = true;

    const loadTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getTripApi(tripId);
        const trip = getEntity(response);

        if (!active) {
          return;
        }

        setForm({
          title: toInputValue(trip?.title),
          status: toInputValue(trip?.status || "PLANNING"),
          budget: toInputValue(trip?.budget),
          startLocation: toInputValue(trip?.startLocation),
          endLocation: toInputValue(trip?.endLocation),
          startTime: toInputValue(trip?.startTime),
          distance: toInputValue(trip?.distance),
          userIds: getTripUserIds(trip, user?.id)
        });
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadTrip();

    return () => {
      active = false;
    };
  }, [isEditing, tripId, user?.id]);

  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const buildPayload = () => ({
    title: form.title,
    status: form.status,
    budget: parseNumber(form.budget),
    startLocation: form.startLocation,
    endLocation: form.endLocation,
    startTime: form.startTime,
    distance: parseNumber(form.distance),
    userIds: parseNumberArray(form.userIds)
  });

  const saveTrip = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = buildPayload();

      if (isEditing) {
        await updateTripApi(tripId, payload);
      } else {
        await createTripApi(payload);
      }

      navigation.goBack();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const isBusy = loading || saving;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <Text variant="headlineSmall" style={styles.heroTitle}>
          {isEditing ? "Edit Trip" : "Add Trip"}
        </Text>
        <Text style={styles.heroSubtitle}>
          {isEditing ? "Update route, budget, dates, and participants." : "Set up the route, budget, dates, and participants."}
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Trip Details
            </Text>
          </View>
          <TextInput
            label="Title"
            value={form.title}
            onChangeText={(value) => setField("title", value)}
            mode="outlined"
          />
          <TextInput
            label="Status"
            value={form.status}
            onChangeText={(value) => setField("status", value)}
            mode="outlined"
            style={{ marginTop: 12 }}
          />
          <TextInput
            label="Budget"
            value={form.budget}
            onChangeText={(value) => setField("budget", value)}
            mode="outlined"
            keyboardType="numeric"
            style={{ marginTop: 12 }}
          />
          <TextInput
            label="Start Location"
            value={form.startLocation}
            onChangeText={(value) => setField("startLocation", value)}
            mode="outlined"
            style={{ marginTop: 12 }}
          />
          <TextInput
            label="End Location"
            value={form.endLocation}
            onChangeText={(value) => setField("endLocation", value)}
            mode="outlined"
            style={{ marginTop: 12 }}
          />
          <View style={styles.routeHint}>
            <Text style={styles.routeHintText}>
              {form.startLocation || "Start"} -> {form.endLocation || "End"}
            </Text>
          </View>
          <TextInput
            label="Start Time"
            value={form.startTime}
            onChangeText={(value) => setField("startTime", value)}
            mode="outlined"
            placeholder="2026-06-01T08:00:00"
            style={{ marginTop: 12 }}
          />
          <TextInput
            label="Distance"
            value={form.distance}
            onChangeText={(value) => setField("distance", value)}
            mode="outlined"
            keyboardType="numeric"
            style={{ marginTop: 12 }}
          />
          <TextInput
            label="User IDs"
            value={form.userIds}
            onChangeText={(value) => setField("userIds", value)}
            mode="outlined"
            placeholder={user?.id != null ? String(user.id) : "1, 2"}
            style={{ marginTop: 12 }}
          />
          <Text style={styles.helperCopy}>Use comma-separated user ids until a full user picker is available here.</Text>

          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <View style={styles.actions}>
            <Button icon="check" mode="contained" onPress={saveTrip} loading={saving} disabled={isBusy} style={{ flex: 1 }}>
              {isEditing ? "Update Trip" : "Create Trip"}
            </Button>
            <Button icon="close" mode="outlined" onPress={() => navigation.goBack()} disabled={isBusy} style={{ flex: 1 }}>
              Cancel
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f3f7fb",
    flex: 1
  },
  screenContent: {
    padding: 16,
    paddingBottom: 40
  },
  hero: {
    backgroundColor: "#e0f2fe",
    borderColor: "#bae6fd",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16
  },
  heroTitle: {
    color: "#12324f",
    fontWeight: "700"
  },
  heroSubtitle: {
    color: "#36566f",
    marginTop: 4
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f3",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 4
  },
  sectionAccent: {
    backgroundColor: "#0284c7",
    borderRadius: 999,
    height: 24,
    width: 5
  },
  sectionTitle: {
    color: "#12324f",
    fontWeight: "700"
  },
  routeHint: {
    backgroundColor: "#f0fdfa",
    borderColor: "#99f6e4",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 10
  },
  routeHintText: {
    color: "#0f766e",
    fontWeight: "700"
  },
  helperCopy: {
    color: "#64748b",
    marginTop: 8
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8
  }
});
