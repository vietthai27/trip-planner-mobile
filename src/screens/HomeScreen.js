import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { Button, Card, Divider, HelperText, IconButton, Text, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  createTripSpendingForStage,
  createTripSpendingForTrip,
  createTripStageForTrip,
  fetchMyTrips,
  fetchStageSpendings,
  fetchTripSpendingTypes,
  fetchTripSpendingsWithoutStage,
  fetchTripStages,
  fetchTripUsers
} from "../store/tripsSlice";
import { MaterialIcons } from '@expo/vector-icons'; // or react-native-vector-iconsimport { MaterialIcons } from '@expo/vector-icons'; // or react-native-vector-icons

const createEmptyStageForm = () => ({
  name: "",
  startTime: "",
  endTime: "",
  location: "",
  activity: ""
});

const createEmptySpendingForm = () => ({
  name: "",
  amount: "",
  userId: null,
  tripSpendingType: "VEHICLE",
  includedUserIds: []
});

const formatValue = (value) => {
  if (value == null || value === "") {
    return "-";
  }

  return String(value);
};

const getTripUsers = (trip) => {
  if (!Array.isArray(trip?.users) || trip.users.length === 0) {
    return "-";
  }

  return trip.users.map((user) => user?.username).filter(Boolean).join(", ") || "-";
};

function formatDateTimeText(isoString) {
  const date = new Date(isoString);

  const pad = (n) => String(n).padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const getSpendingUsers = (spending) => {
  if (!Array.isArray(spending?.includedUsers) || spending.includedUsers.length === 0) {
    return "-";
  }

  return spending.includedUsers.map((user) => user?.username).filter(Boolean).join(", ") || "-";
};

const formatAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return formatValue(value);
  }

  return amount.toLocaleString();
};

const getStageTime = (stage) =>
  `${formatValue(stage?.startTime)} to ${formatValue(stage?.endTime)}`;

const toPickerDate = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
};

const formatDateTime = (value) => {
  if (!value) {
    return "Select date and time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const toDateTimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = toPickerDate(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const fromDateTimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
};

function DateTimeField({ label, value, onChange }) {
  const [pickerMode, setPickerMode] = useState(null);

  const hidePicker = () => setPickerMode(null);

  const setSelectedValue = (mode, event, selectedDate) => {
    hidePicker();

    if (event?.type === "dismissed" || !selectedDate) {
      return;
    }

    const currentDate = toPickerDate(value);
    const nextDate = new Date(currentDate);

    if (mode === "date") {
      nextDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    } else {
      nextDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    }

    onChange(nextDate.toISOString());
  };

  const openPicker = (mode) => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: toPickerDate(value),
        mode,
        display: mode === "time" ? "clock" : "calendar",
        onChange: (event, selectedDate) => setSelectedValue(mode, event, selectedDate)
      });
      return;
    }

    setPickerMode(mode);
  };

  const showDatePicker = () => openPicker("date");
  const showTimePicker = () => openPicker("time");

  if (Platform.OS === "web") {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ color: "#59616d", marginBottom: 6 }}>{label}</Text>
        <input
          type="datetime-local"
          value={toDateTimeLocalValue(value)}
          onChange={(event) => onChange(fromDateTimeLocalValue(event.target.value))}
          style={{
            borderColor: "#79747e",
            borderRadius: 3,
            borderStyle: "solid",
            borderWidth: 1,
            boxSizing: "border-box",
            fontSize: 16,
            height: 48,
            padding: "0 12px",
            width: "100%"
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: "#59616d", marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button mode="outlined" onPress={showDatePicker} style={{ flex: 1 }}>
          {formatDateTime(value)}
        </Button>
        <Button mode="contained-tonal" onPress={showTimePicker}>
          Time
        </Button>
      </View>
      {pickerMode ? (
        <DateTimePicker
          value={toPickerDate(value)}
          mode={pickerMode}
          display="default"
          onChange={(event, selectedDate) => setSelectedValue(pickerMode, event, selectedDate)}
        />
      ) : null}
    </View>
  );
}

function InfoPill({ label, value, tone = "neutral" }) {
  const isCustomValue = React.isValidElement(value);

  return (
    <View style={[styles.infoPill, styles[`${tone}Pill`]]}>
      <Text
        variant="labelSmall"
        style={[styles.infoPillLabel, styles[`${tone}PillLabel`]]}
      >
        {label}
      </Text>

      {isCustomValue ? (
        value
      ) : (
        <Text variant="labelMedium" style={styles.infoPillValue} numberOfLines={1}>
          {formatValue(value)}
        </Text>
      )}
    </View>
  );
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="labelMedium" style={styles.detailLabel}>
        {label}
      </Text>
      <Text style={styles.detailValue}>{formatValue(value)}</Text>
    </View>
  );
}

function SectionPanel({ title, tone = "neutral", children }) {
  return (
    <View style={[styles.sectionPanel, styles[`${tone}Panel`]]}>
      <Text variant="labelLarge" style={[styles.sectionTitle, styles[`${tone}Title`]]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function SpendingCard({ spending, tone = "trip" }) {
  return (
    <View style={[styles.spendingCard, styles[`${tone}SpendingCard`]]}>
      <View style={styles.spendingHeader}>
        <View style={[styles.spendingDot, styles[`${tone}Dot`]]} />
        <Text variant="labelLarge" style={styles.spendingName}>
          {formatValue(spending?.name)}
        </Text>
        <Text variant="labelLarge" style={styles.spendingAmount}>
          {formatAmount(spending?.amount)}
        </Text>
      </View>
      <View style={styles.spendingMetaGrid}>
        <DetailRow label="Type" value={spending?.tripSpendingType} />
        <DetailRow label="Paid by" value={spending?.user?.username} />
        <DetailRow label="Included" value={getSpendingUsers(spending)} />
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [stageFormsByTripId, setStageFormsByTripId] = useState({});
  const [showStageFormByTripId, setShowStageFormByTripId] = useState({});
  const [spendingFormsByKey, setSpendingFormsByKey] = useState({});
  const [showSpendingFormByKey, setShowSpendingFormByKey] = useState({});
  const [showStagesByTripId, setShowStagesByTripId] = useState({});
  const [showTripSpendingsByTripId, setShowTripSpendingsByTripId] = useState({});
  const [showStageSpendingsByStageId, setShowStageSpendingsByStageId] = useState({});
  const [activeTripTabByTripId, setActiveTripTabByTripId] = useState({});
  const user = useSelector((state) => state.auth.user);
  const {
    myTrips,
    loading,
    error,
    stagesByTripId,
    stagesLoadingByTripId,
    stagesErrorByTripId,
    createStageLoadingByTripId,
    createStageErrorByTripId,
    spendingsByStageId,
    spendingsLoadingByStageId,
    spendingsErrorByStageId,
    spendingsWithoutStageByTripId,
    spendingsWithoutStageLoadingByTripId,
    spendingsWithoutStageErrorByTripId,
    createSpendingLoadingByKey,
    createSpendingErrorByKey,
    spendingTypes,
    spendingTypesLoading,
    spendingTypesError,
    usersByTripId,
    usersLoadingByTripId,
    usersErrorByTripId
  } = useSelector((state) => state.trips);

  useEffect(() => {
    if (user?.username) {
      dispatch(fetchMyTrips());
      dispatch(fetchTripSpendingTypes());
    }
  }, [dispatch, user?.username]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.username) {
        dispatch(fetchMyTrips());
      }
    }, [dispatch, user?.username])
  );

  const refreshTrips = () => {
    dispatch(fetchMyTrips());
  };

  const toggleTripStages = (tripId) => {
    if (tripId == null) {
      return;
    }

    const nextVisible = activeTripTabByTripId[tripId] !== "stages";

    setActiveTripTabByTripId((current) => ({
      ...current,
      [tripId]: nextVisible ? "stages" : null
    }));
    setShowStagesByTripId((current) => ({
      ...current,
      [tripId]: nextVisible
    }));
    setShowTripSpendingsByTripId((current) => ({
      ...current,
      [tripId]: false
    }));

    if (!Object.prototype.hasOwnProperty.call(stagesByTripId, tripId)) {
      dispatch(fetchTripStages(tripId));
    }
  };

  const toggleStageSpendings = (stageId) => {
    if (stageId == null) {
      return;
    }

    setShowStageSpendingsByStageId((current) => ({
      ...current,
      [stageId]: !current[stageId]
    }));

    if (!Object.prototype.hasOwnProperty.call(spendingsByStageId, stageId)) {
      dispatch(fetchStageSpendings(stageId));
    }
  };

  const toggleTripSpendingsWithoutStage = (tripId) => {
    if (tripId == null) {
      return;
    }

    const nextVisible = activeTripTabByTripId[tripId] !== "spendings";

    setActiveTripTabByTripId((current) => ({
      ...current,
      [tripId]: nextVisible ? "spendings" : null
    }));
    setShowTripSpendingsByTripId((current) => ({
      ...current,
      [tripId]: nextVisible
    }));
    setShowStagesByTripId((current) => ({
      ...current,
      [tripId]: false
    }));

    if (!Object.prototype.hasOwnProperty.call(spendingsWithoutStageByTripId, tripId)) {
      dispatch(fetchTripSpendingsWithoutStage(tripId));
    }
  };

  const toggleStageForm = (tripId) => {
    setShowStageFormByTripId((current) => ({
      ...current,
      [tripId]: !current[tripId]
    }));
    setStageFormsByTripId((current) => ({
      ...current,
      [tripId]: current[tripId] || createEmptyStageForm()
    }));
  };

  const setStageFormField = (tripId, field, value) => {
    setStageFormsByTripId((current) => ({
      ...current,
      [tripId]: {
        ...(current[tripId] || createEmptyStageForm()),
        [field]: value
      }
    }));
  };

  const toggleSpendingForm = (key, tripId) => {
    if (!spendingTypesLoading && spendingTypes.length === 0) {
      dispatch(fetchTripSpendingTypes());
    }

    if (tripId != null && !usersLoadingByTripId[tripId] && !Object.prototype.hasOwnProperty.call(usersByTripId, tripId)) {
      dispatch(fetchTripUsers(tripId));
    }

    setShowSpendingFormByKey((current) => ({
      ...current,
      [key]: !current[key]
    }));
    setSpendingFormsByKey((current) => ({
      ...current,
      [key]: current[key] || createEmptySpendingForm()
    }));
  };

  const toggleIncludedUser = (key, userId) => {
    setSpendingFormsByKey((current) => {
      const form = current[key] || createEmptySpendingForm();
      const currentIds = Array.isArray(form.includedUserIds) ? form.includedUserIds : [];
      const nextIds = currentIds.includes(userId)
        ? currentIds.filter((id) => id !== userId)
        : [...currentIds, userId];

      return {
        ...current,
        [key]: {
          ...form,
          includedUserIds: nextIds
        }
      };
    });
  };

  const getSelectedPayerId = (form, tripUsers) => {
    if (form.userId != null && tripUsers.some((tripUser) => tripUser?.id === form.userId)) {
      return form.userId;
    }

    if (user?.id != null && tripUsers.some((tripUser) => tripUser?.id === user.id)) {
      return user.id;
    }

    return tripUsers[0]?.id ?? user?.id ?? null;
  };

  const setSpendingFormField = (key, field, value) => {
    setSpendingFormsByKey((current) => ({
      ...current,
      [key]: {
        ...(current[key] || createEmptySpendingForm()),
        [field]: value
      }
    }));
  };

  const getSelectedSpendingType = (form) => {
    if (form.tripSpendingType && (spendingTypes.length === 0 || spendingTypes.includes(form.tripSpendingType))) {
      return form.tripSpendingType;
    }

    return spendingTypes[0] || "VEHICLE";
  };

  const buildSpendingPayload = (form, tripId) => {
    const tripUsers = usersByTripId[tripId] || [];

    return {
      name: form.name,
      amount: Number(form.amount),
      userId: getSelectedPayerId(form, tripUsers),
      tripSpendingType: getSelectedSpendingType(form),
      includedUserIds:
        Array.isArray(form.includedUserIds) && form.includedUserIds.length > 0
          ? form.includedUserIds
          : user?.id != null
            ? [user.id]
            : []
    };
  };

  const createStage = async (tripId) => {
    if (tripId == null) {
      return;
    }

    const stage = stageFormsByTripId[tripId] || createEmptyStageForm();

    try {
      await dispatch(createTripStageForTrip({ tripId, stage })).unwrap();
      setStageFormsByTripId((current) => ({
        ...current,
        [tripId]: createEmptyStageForm()
      }));
    } catch {
      // Error state is handled by Redux and rendered under the form.
    }
  };

  const createTripSpending = async (tripId) => {
    if (tripId == null) {
      return;
    }

    const key = `trip-${tripId}`;
    const form = spendingFormsByKey[key] || createEmptySpendingForm();

    try {
      await dispatch(createTripSpendingForTrip({ tripId, spending: buildSpendingPayload(form, tripId) })).unwrap();
      setSpendingFormsByKey((current) => ({
        ...current,
        [key]: createEmptySpendingForm()
      }));
    } catch {
      // Error state is handled by Redux and rendered under the form.
    }
  };

  const createStageSpending = async (tripId, stageId) => {
    if (tripId == null || stageId == null) {
      return;
    }

    const key = `stage-${stageId}`;
    const form = spendingFormsByKey[key] || createEmptySpendingForm();

    try {
      await dispatch(
        createTripSpendingForStage({ tripId, stageId, spending: buildSpendingPayload(form, tripId) })
      ).unwrap();
      setSpendingFormsByKey((current) => ({
        ...current,
        [key]: createEmptySpendingForm()
      }));
    } catch {
      // Error state is handled by Redux and rendered under the form.
    }
  };

  const renderSpendingForm = ({ formKey, tripId, onSubmit, loading, error, submitLabel }) => {
    const form = spendingFormsByKey[formKey] || createEmptySpendingForm();
    const selectedType = getSelectedSpendingType(form);
    const tripUsers = usersByTripId[tripId] || [];
    const usersLoading = usersLoadingByTripId[tripId] === true;
    const usersError = usersErrorByTripId[tripId];
    const selectedUserIds = Array.isArray(form.includedUserIds) ? form.includedUserIds : [];
    const selectedPayerId = getSelectedPayerId(form, tripUsers);

    return (
      <SectionPanel title="New Spending" tone="form">
        <TextInput
          label="Spending Name"
          value={form.name}
          onChangeText={(value) => setSpendingFormField(formKey, "name", value)}
          mode="outlined"
        />
        <TextInput
          label="Amount"
          value={form.amount}
          onChangeText={(value) => setSpendingFormField(formKey, "amount", value)}
          mode="outlined"
          keyboardType="numeric"
          style={{ marginTop: 10 }}
        />
        <View style={styles.selectorGroup}>
          <Text style={{ color: "#59616d", marginBottom: 6 }}>Paid By</Text>
          {usersLoading ? <Text style={{ color: "#59616d" }}>Loading trip users...</Text> : null}
          <HelperText type="error" visible={!!usersError}>
            {usersError}
          </HelperText>
          {tripUsers.length === 0 && !usersLoading ? (
            <Text style={{ color: "#59616d" }}>No trip users found.</Text>
          ) : null}
          <View style={styles.chipWrap}>
            {tripUsers.map((tripUser) => {
              const tripUserId = tripUser?.id;

              return (
                <Button
                  key={tripUserId}
                  mode={selectedPayerId === tripUserId ? "contained" : "outlined"}
                  onPress={() => setSpendingFormField(formKey, "userId", tripUserId)}
                  disabled={tripUserId == null}
                  compact
                >
                  {tripUser?.username || `User ${tripUserId}`}
                </Button>
              );
            })}
          </View>
        </View>
        <View style={styles.selectorGroup}>
          <Text style={{ color: "#59616d", marginBottom: 6 }}>Included Users</Text>
          <View style={styles.chipWrap}>
            {tripUsers.map((tripUser) => {
              const tripUserId = tripUser?.id;
              const selected = selectedUserIds.includes(tripUserId);

              return (
                <Button
                  key={tripUserId}
                  mode={selected ? "contained" : "outlined"}
                  onPress={() => toggleIncludedUser(formKey, tripUserId)}
                  disabled={tripUserId == null}
                  compact
                >
                  {tripUser?.username || `User ${tripUserId}`}
                </Button>
              );
            })}
          </View>
        </View>
        <View style={styles.selectorGroup}>
          <Text style={{ color: "#59616d", marginBottom: 6 }}>Type</Text>
          {spendingTypesLoading ? (
            <Text style={{ color: "#59616d" }}>Loading spending types...</Text>
          ) : null}
          <HelperText type="error" visible={!!spendingTypesError}>
            {spendingTypesError}
          </HelperText>
          <View style={styles.chipWrap}>
            {(spendingTypes.length > 0 ? spendingTypes : [selectedType]).map((type) => (
              <Button
                key={type}
                mode={selectedType === type ? "contained" : "outlined"}
                onPress={() => setSpendingFormField(formKey, "tripSpendingType", type)}
                compact
              >
                {type}
              </Button>
            ))}
          </View>
        </View>

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>

        <Button
          icon="check"
          mode="contained"
          onPress={onSubmit}
          loading={loading}
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {submitLabel}
        </Button>
      </SectionPanel>
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.pageHeader}>
        <View style={{ flex: 1 }}>
          <Text variant="headlineSmall" style={styles.pageTitle}>
            {user?.username ? `Trips for ${user.username}` : "Trips for current user"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button icon="plus" mode="contained" onPress={() => navigation.navigate("AddTrip")}>
            Add Trip
          </Button>
        </View>
      </View>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      {myTrips.length === 0 ? (
        <Text style={{ color: "#59616d", marginTop: 8 }}>
          {loading ? "Loading trips..." : "No trips found."}
        </Text>
      ) : (
        myTrips.map((trip, index) => {
          const tripId = trip?.id;
          const stages = stagesByTripId[tripId] || [];
          const stagesLoading = stagesLoadingByTripId[tripId] === true;
          const stagesError = stagesErrorByTripId[tripId];
          const stageForm = stageFormsByTripId[tripId] || createEmptyStageForm();
          const showStageForm = showStageFormByTripId[tripId] === true;
          const createStageLoading = createStageLoadingByTripId[tripId] === true;
          const createStageError = createStageErrorByTripId[tripId];
          const tripSpendingsWithoutStage = spendingsWithoutStageByTripId[tripId] || [];
          const tripSpendingsWithoutStageLoading = spendingsWithoutStageLoadingByTripId[tripId] === true;
          const tripSpendingsWithoutStageError = spendingsWithoutStageErrorByTripId[tripId];
          const tripSpendingFormKey = `trip-${tripId}`;
          const showTripSpendingForm = showSpendingFormByKey[tripSpendingFormKey] === true;
          const showStages = showStagesByTripId[tripId] === true;
          const showTripSpendings = showTripSpendingsByTripId[tripId] === true;
          const activeTripTab = activeTripTabByTripId[tripId];
          const createTripSpendingLoading = createSpendingLoadingByKey[tripSpendingFormKey] === true;
          const createTripSpendingError = createSpendingErrorByKey[tripSpendingFormKey];
          const hasLoadedTripSpendingsWithoutStage = Object.prototype.hasOwnProperty.call(
            spendingsWithoutStageByTripId,
            tripId
          );
          const hasLoadedStages = Object.prototype.hasOwnProperty.call(stagesByTripId, tripId);

          return (
            <Card key={`${tripId ?? "trip"}-${index}`} style={styles.tripCard}>
              <Card.Content style={styles.tripCardContent}>
                <View style={styles.tripHeader}>
                  <View style={styles.tripAccent} />
                  <View style={styles.tripHeaderText}>
                    <Text variant="titleLarge" style={styles.tripTitle}>
                      {formatValue(trip?.title)}
                    </Text>
                    <Text style={styles.routeText}>
                      {formatValue(trip?.startLocation)} -> {formatValue(trip?.endLocation)}
                    </Text>
                  </View>
                  <IconButton
                    icon="pencil"
                    mode="contained-tonal"
                    onPress={() => navigation.navigate("EditTrip", { tripId })}
                    disabled={tripId == null}
                    style={styles.editIconButton}
                    accessibilityLabel="Edit trip"
                  />
                </View>

                <View style={styles.pillGrid}>
                  <InfoPill
                    label="Status"
                    value={
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <Text style={styles.infoPillValue}>Waiting</Text>
                        <MaterialIcons name="hourglass-empty" size={16} color="#3b82f6" />
                      </View>
                    }
                    tone="blue"
                  />
                  <InfoPill label="Budget" value={
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={styles.infoPillValue}>{formatAmount(trip?.budget)}</Text>
                      <MaterialIcons name="attach-money" size={16} color="#3b82f6" />
                    </View>
                  } tone="green" />
                  <InfoPill label="Distance" value={
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={styles.infoPillValue}>{formatValue(trip?.distance) + " km"}</Text>
                      <MaterialIcons name="add-road" size={16} color="#3b82f6" />
                    </View>
                  } tone="orange" />
                  <InfoPill label="Start" value={
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={styles.infoPillValue}>{formatDateTimeText(trip?.startTime)}</Text>
                      <MaterialIcons name="timer" size={16} color="#3b82f6" />
                    </View>
                  } tone="purple" />
                </View>
                <View style={styles.tabBar}>
                  <Button
                    icon="map-marker-path"
                    mode={activeTripTab === "stages" ? "contained" : "outlined"}
                    onPress={() => toggleTripStages(tripId)}
                    loading={stagesLoading}
                    disabled={tripId == null || stagesLoading}
                    style={styles.tabButton}
                  >
                    Stages
                  </Button>
                  <Button
                    icon="cash-multiple"
                    mode={activeTripTab === "spendings" ? "contained" : "outlined"}
                    onPress={() => toggleTripSpendingsWithoutStage(tripId)}
                    loading={tripSpendingsWithoutStageLoading}
                    disabled={tripId == null || tripSpendingsWithoutStageLoading}
                    style={styles.tabButton}
                  >
                    Trip Spendings
                  </Button>
                </View>

                {showTripSpendings ? (
                  <Button
                    icon={showTripSpendingForm ? "chevron-up" : "plus"}
                    mode="contained-tonal"
                    onPress={() => toggleSpendingForm(tripSpendingFormKey, tripId)}
                    disabled={tripId == null}
                    style={styles.fullWidthAction}
                  >
                    {showTripSpendingForm ? "Hide Form" : "Add Trip Spending"}
                  </Button>
                ) : null}

                {showTripSpendings && showTripSpendingForm
                  ? renderSpendingForm({
                    formKey: tripSpendingFormKey,
                    tripId,
                    onSubmit: () => createTripSpending(tripId),
                    loading: createTripSpendingLoading,
                    error: createTripSpendingError,
                    submitLabel: "Create Trip Spending"
                  })
                  : null}

                {showTripSpendings ? (
                  <HelperText type="error" visible={!!tripSpendingsWithoutStageError}>
                    {tripSpendingsWithoutStageError}
                  </HelperText>
                ) : null}

                {showTripSpendings && hasLoadedTripSpendingsWithoutStage && tripSpendingsWithoutStage.length === 0 ? (
                  <Text style={{ color: "#59616d", marginTop: 4 }}>No trip spendings without stage found.</Text>
                ) : null}

                {showTripSpendings && tripSpendingsWithoutStage.length > 0 ? (
                  <SectionPanel title="Trip Spendings" tone="tripSpend">
                    {tripSpendingsWithoutStage.map((spending, spendingIndex) => (
                      <SpendingCard
                        key={`${spending?.id ?? "trip-spending"}-${spendingIndex}`}
                        spending={spending}
                        tone="trip"
                      />
                    ))}
                  </SectionPanel>
                ) : null}

                {showStages ? (
                  <Button
                    icon={showStageForm ? "chevron-up" : "plus"}
                    mode="contained"
                    onPress={() => toggleStageForm(tripId)}
                    disabled={tripId == null}
                    style={styles.fullWidthAction}
                  >
                    {showStageForm ? "Hide Stage Form" : "Add Stage"}
                  </Button>
                ) : null}

                {showStages && showStageForm ? (
                  <SectionPanel title="New Stage" tone="form">
                    <TextInput
                      label="Name"
                      value={stageForm.name}
                      onChangeText={(value) => setStageFormField(tripId, "name", value)}
                      mode="outlined"
                    />
                    <DateTimeField
                      label="Start Time"
                      value={stageForm.startTime}
                      onChange={(value) => setStageFormField(tripId, "startTime", value)}
                    />
                    <DateTimeField
                      label="End Time"
                      value={stageForm.endTime}
                      onChange={(value) => setStageFormField(tripId, "endTime", value)}
                    />
                    <TextInput
                      label="Location"
                      value={stageForm.location}
                      onChangeText={(value) => setStageFormField(tripId, "location", value)}
                      mode="outlined"
                      style={{ marginTop: 10 }}
                    />
                    <TextInput
                      label="Activity"
                      value={stageForm.activity}
                      onChangeText={(value) => setStageFormField(tripId, "activity", value)}
                      mode="outlined"
                      multiline
                      style={{ marginTop: 10 }}
                    />

                    <HelperText type="error" visible={!!createStageError}>
                      {createStageError}
                    </HelperText>

                    <Button
                      icon="check"
                      mode="contained"
                      onPress={() => createStage(tripId)}
                      loading={createStageLoading}
                      disabled={createStageLoading}
                      style={{ marginTop: 4 }}
                    >
                      Create Stage
                    </Button>
                  </SectionPanel>
                ) : null}

                {showStages ? (
                  <HelperText type="error" visible={!!stagesError}>
                    {stagesError}
                  </HelperText>
                ) : null}

                {showStages && hasLoadedStages && stages.length === 0 ? (
                  <Text style={{ color: "#59616d", marginTop: 8 }}>No stages found.</Text>
                ) : null}

                {showStages ? stages.map((stage, stageIndex) => {
                  const stageId = stage?.id;
                  const spendings = spendingsByStageId[stageId] || [];
                  const spendingsLoading = spendingsLoadingByStageId[stageId] === true;
                  const spendingsError = spendingsErrorByStageId[stageId];
                  const stageSpendingFormKey = `stage-${stageId}`;
                  const showStageSpendingForm = showSpendingFormByKey[stageSpendingFormKey] === true;
                  const showStageSpendings = showStageSpendingsByStageId[stageId] === true;
                  const createStageSpendingLoading = createSpendingLoadingByKey[stageSpendingFormKey] === true;
                  const createStageSpendingError = createSpendingErrorByKey[stageSpendingFormKey];
                  const hasLoadedSpendings = Object.prototype.hasOwnProperty.call(spendingsByStageId, stageId);

                  return (
                    <View key={`${stageId ?? "stage"}-${stageIndex}`} style={styles.stageCard}>
                      <View style={styles.stageHeader}>
                        <View style={styles.stageNumber}>
                          <Text style={styles.stageNumberText}>{stageIndex + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text variant="titleMedium" style={styles.stageTitle}>
                            {formatValue(stage?.name)}
                          </Text>
                          <Text style={styles.stageMeta}>{formatValue(stage?.location)}</Text>
                        </View>
                      </View>
                      <View style={styles.stageDetails}>
                        <DetailRow label="Time" value={getStageTime(stage)} />
                        <DetailRow label="Activity" value={stage?.activity} />
                      </View>

                      <View style={styles.secondaryActions}>
                        <Button
                          icon={showStageSpendings ? "chevron-up" : "cash"}
                          mode="outlined"
                          onPress={() => toggleStageSpendings(stageId)}
                          loading={spendingsLoading}
                          disabled={stageId == null || spendingsLoading}
                          style={styles.actionButton}
                        >
                          {showStageSpendings ? "Hide Spendings" : "Show Spendings"}
                        </Button>
                        <Button
                          icon={showStageSpendingForm ? "chevron-up" : "plus"}
                          mode="contained-tonal"
                          onPress={() => toggleSpendingForm(stageSpendingFormKey, tripId)}
                          disabled={stageId == null}
                          style={styles.actionButton}
                        >
                          {showStageSpendingForm ? "Hide Form" : "Add Stage Spending"}
                        </Button>
                      </View>

                      {showStageSpendingForm
                        ? renderSpendingForm({
                          formKey: stageSpendingFormKey,
                          tripId,
                          onSubmit: () => createStageSpending(tripId, stageId),
                          loading: createStageSpendingLoading,
                          error: createStageSpendingError,
                          submitLabel: "Create Stage Spending"
                        })
                        : null}

                      {showStageSpendings ? (
                        <HelperText type="error" visible={!!spendingsError}>
                          {spendingsError}
                        </HelperText>
                      ) : null}

                      {showStageSpendings && hasLoadedSpendings && spendings.length === 0 ? (
                        <Text style={{ color: "#59616d", marginTop: 4 }}>No spendings found.</Text>
                      ) : null}

                      {showStageSpendings && spendings.length > 0 ? (
                        <SectionPanel title="Stage Spendings" tone="stageSpend">
                          {spendings.map((spending, spendingIndex) => (
                            <SpendingCard
                              key={`${spending?.id ?? "spending"}-${spendingIndex}`}
                              spending={spending}
                              tone="stage"
                            />
                          ))}
                        </SectionPanel>
                      ) : null}
                    </View>
                  );
                }) : null}
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f3f7fb",
    flex: 1
  },
  screenContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 96
  },
  pageHeader: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f3",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    padding: 14
  },
  pageBadge: {
    alignItems: "center",
    backgroundColor: "#0284c7",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  pageBadgeText: {
    color: "#ffffff",
    fontWeight: "800"
  },
  pageTitle: {
    color: "#12324f",
    fontWeight: "700"
  },
  pageSubtitle: {
    color: "#5a6b7b",
    marginTop: 2
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-end"
  },
  tripCard: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f3",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14
  },
  tripCardContent: {
    paddingBottom: 18
  },
  tripHeader: {
    flexDirection: "row",
    gap: 12
  },
  tripAccent: {
    backgroundColor: "#0284c7",
    borderRadius: 999,
    width: 6
  },
  tripHeaderText: {
    flex: 1
  },
  editIconButton: {
    margin: 0
  },
  tripTitle: {
    color: "#12324f",
    fontWeight: "700"
  },
  routeText: {
    color: "#5a6b7b",
    marginTop: 3
  },
  pillGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  infoPill: {
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 132,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  infoPillLabel: {
    fontWeight: "700"
  },
  infoPillValue: {
    color: "#172033",
    marginTop: 2
  },
  neutralPill: {
    backgroundColor: "#f8fafc",
    borderColor: "#d8dee9"
  },
  neutralPillLabel: {
    color: "#475569"
  },
  bluePill: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe"
  },
  bluePillLabel: {
    color: "#1d4ed8"
  },
  greenPill: {
    backgroundColor: "#ecfdf5",
    borderColor: "#bbf7d0"
  },
  greenPillLabel: {
    color: "#047857"
  },
  orangePill: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa"
  },
  orangePillLabel: {
    color: "#c2410c"
  },
  purplePill: {
    backgroundColor: "#f5f3ff",
    borderColor: "#ddd6fe"
  },
  purplePillLabel: {
    color: "#6d28d9"
  },
  sectionPanel: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12
  },
  peoplePanel: {
    backgroundColor: "#f0fdfa",
    borderColor: "#99f6e4"
  },
  tripSpendPanel: {
    backgroundColor: "#fff7ed",
    borderColor: "#fed7aa"
  },
  stageSpendPanel: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd"
  },
  formPanel: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1"
  },
  neutralPanel: {
    backgroundColor: "#ffffff",
    borderColor: "#d8dee9"
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 6
  },
  peopleTitle: {
    color: "#0f766e"
  },
  tripSpendTitle: {
    color: "#c2410c"
  },
  stageSpendTitle: {
    color: "#0369a1"
  },
  formTitle: {
    color: "#334155"
  },
  neutralTitle: {
    color: "#334155"
  },
  panelText: {
    color: "#334155"
  },
  primaryActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  tabBar: {
    backgroundColor: "#eef6ff",
    borderColor: "#bfdbfe",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    padding: 6
  },
  tabButton: {
    flex: 1
  },
  secondaryActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10
  },
  actionButton: {
    flexGrow: 1
  },
  fullWidthAction: {
    marginTop: 12
  },
  selectorGroup: {
    marginTop: 10
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  spendingCard: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    padding: 10
  },
  tripSpendingCard: {
    borderColor: "#fdba74"
  },
  stageSpendingCard: {
    borderColor: "#7dd3fc"
  },
  spendingHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  spendingDot: {
    borderRadius: 999,
    height: 10,
    width: 10
  },
  tripDot: {
    backgroundColor: "#ea580c"
  },
  stageDot: {
    backgroundColor: "#0284c7"
  },
  spendingName: {
    color: "#172033",
    flex: 1
  },
  spendingAmount: {
    color: "#0f766e",
    fontWeight: "700"
  },
  spendingMetaGrid: {
    marginTop: 8
  },
  detailRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 3
  },
  detailLabel: {
    color: "#64748b",
    minWidth: 72
  },
  detailValue: {
    color: "#334155",
    flex: 1
  },
  stageCard: {
    backgroundColor: "#ffffff",
    borderColor: "#bfdbfe",
    borderLeftColor: "#0284c7",
    borderLeftWidth: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12
  },
  stageHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10
  },
  stageNumber: {
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  stageNumberText: {
    color: "#0369a1",
    fontWeight: "700"
  },
  stageTitle: {
    color: "#12324f",
    fontWeight: "700"
  },
  stageMeta: {
    color: "#5a6b7b",
    marginTop: 2
  },
  stageDetails: {
    marginTop: 8
  },
  infoPillValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
