import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { useSelector } from "react-redux";
import {
  createTripApi,
  getTripApi,
  listTripSelectableUsersApi,
  listTripUsersApi,
  updateTripApi
} from "../api/tripApi";
import DateTimeField from "../components/home/DateTimeField";

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

const getItems = (response) => {
  const value = response?.data ?? response;

  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.results)) {
    return value.results;
  }

  return [];
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

const formatVND = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseFormattedNumber = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");

  return digits === "" ? null : Number(digits);
};

const parseNumberArray = (value) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);

const toUserIdsValue = (ids) => ids.join(", ");

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
  const [tripUsers, setTripUsers] = useState([]);
  const [tripUsersLoading, setTripUsersLoading] = useState(false);
  const [tripUsersError, setTripUsersError] = useState(null);

  useEffect(() => {
    if (!isEditing) {
      setForm(initialForm);
    }
  }, [initialForm, isEditing]);

  useEffect(() => {
    if (isEditing) {
      return;
    }

    let active = true;

    const loadSelectableUsers = async () => {
      setTripUsersLoading(true);
      setTripUsersError(null);
      try {
        const response = await listTripSelectableUsersApi();
        const users = getItems(response);

        if (active) {
          setTripUsers(users);
        }
      } catch (requestError) {
        if (active) {
          setTripUsers(user?.id != null ? [user] : []);
          setTripUsersError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setTripUsersLoading(false);
        }
      }
    };

    loadSelectableUsers();

    return () => {
      active = false;
    };
  }, [isEditing, user]);

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
          budget: formatVND(trip?.budget),
          startLocation: toInputValue(trip?.startLocation),
          endLocation: toInputValue(trip?.endLocation),
          startTime: toInputValue(trip?.startTime),
          distance: toInputValue(trip?.distance),
          userIds: getTripUserIds(trip, user?.id)
        });

        if (Array.isArray(trip?.users)) {
          setTripUsers(trip.users);
        }
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

  useEffect(() => {
    if (!isEditing || tripId == null) {
      return;
    }

    let active = true;

    const loadTripUsers = async () => {
      setTripUsersLoading(true);
      setTripUsersError(null);
      try {
        const response = await listTripUsersApi(tripId);
        const users = getItems(response);

        if (active) {
          setTripUsers(users);
          if (users.length > 0) {
            setField("userIds", toUserIdsValue(users.map((tripUser) => tripUser?.id).filter((id) => id != null)));
          }
        }
      } catch (requestError) {
        if (active) {
          setTripUsersError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setTripUsersLoading(false);
        }
      }
    };

    loadTripUsers();

    return () => {
      active = false;
    };
  }, [isEditing, tripId]);

  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const toggleUserId = (userId) => {
    const numericUserId = Number(userId);

    if (!Number.isFinite(numericUserId)) {
      return;
    }

    setForm((current) => {
      const selectedIds = parseNumberArray(current.userIds);
      const nextIds = selectedIds.includes(numericUserId)
        ? selectedIds.filter((selectedId) => selectedId !== numericUserId)
        : [...selectedIds, numericUserId];

      return {
        ...current,
        userIds: toUserIdsValue(nextIds)
      };
    });
  };

  const buildPayload = () => ({
    title: form.title,
    status: form.status,
    budget: parseFormattedNumber(form.budget),
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
  const selectedUserIds = parseNumberArray(form.userIds);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <Text variant="headlineSmall" style={styles.heroTitle}>
          {isEditing ? "Sửa chuyến đi" : "Thêm chuyến đi"}
        </Text>
        <Text style={styles.heroSubtitle}>
          {isEditing ? "Cập nhật lộ trình, ngân sách, ngày tháng và người tham gia." : "Thiết lập lộ trình, ngân sách, ngày tháng và người tham gia."}
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionAccent} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Chi tiết chuyến đi
            </Text>
          </View>
          <TextInput
            label="Tiêu đề"
            value={form.title}
            onChangeText={(value) => setField("title", value)}
            mode="outlined"
          />
          <TextInput
            label="Ngân sách"
            value={form.budget}
            onChangeText={(value) =>
              setField("budget", formatVND(value))
            }
            mode="outlined"
            keyboardType="numeric"
            style={{ marginTop: 12 }}
          />
          <TextInput
            label="Địa điểm bắt đầu"
            value={form.startLocation}
            onChangeText={(value) => setField("startLocation", value)}
            mode="outlined"
            style={{ marginTop: 12 }}
          />
          <TextInput
            label="Địa điểm kết thúc"
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
          <DateTimeField
            label="Thời gian bắt đầu"
            value={form.startTime}
            onChange={(value) => setField("startTime", value)}
          />
          <TextInput
            label="Khoảng cách"
            value={form.distance}
            onChangeText={(value) => setField("distance", value)}
            mode="outlined"
            keyboardType="numeric"
            style={{ marginTop: 12 }}
          />
          <View style={styles.selectorGroup}>
            <Text style={styles.selectorLabel}>Người tham gia chuyến đi</Text>
            {tripUsersLoading ? (
              <Text style={styles.helperCopy}>Đang tải người dùng...</Text>
            ) : null}
            <HelperText type="error" visible={!!tripUsersError}>
              {tripUsersError}
            </HelperText>
            {tripUsers.length === 0 && !tripUsersLoading ? (
              <Text style={styles.helperCopy}>Không tìm thấy người dùng nào.</Text>
            ) : null}
            <View style={styles.chipWrap}>
              {tripUsers.map((tripUser) => {
                const tripUserId = tripUser?.id;
                const selected = selectedUserIds.includes(Number(tripUserId));

                return (
                  <Button
                    key={tripUserId}
                    mode={selected ? "contained" : "outlined"}
                    onPress={() => toggleUserId(tripUserId)}
                    disabled={tripUserId == null || isBusy}
                    compact
                  >
                    {tripUser?.username || `User ${tripUserId}`}
                  </Button>
                );
              })}
            </View>
          </View>

          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <View style={styles.actions}>
            <Button icon="check" mode="contained" onPress={saveTrip} loading={saving} disabled={isBusy} style={{ flex: 1 }}>
              {isEditing ? "Sửa" : "Thêm"}
            </Button>
            <Button icon="close" mode="outlined" onPress={() => navigation.goBack()} disabled={isBusy} style={{ flex: 1 }}>
              Hủy
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
  selectorGroup: {
    marginTop: 12
  },
  selectorLabel: {
    color: "#59616d",
    marginBottom: 6
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8
  }
});
