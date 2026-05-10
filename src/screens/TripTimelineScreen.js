import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, HelperText, Text } from "react-native-paper";
import {
  createTripSpendingApi,
  createTripStageApi,
  getTripApi,
  listTripSpendingTypesApi,
  listTripSpendingsByStageApi,
  listTripSpendingsWithoutStageApi,
  listTripStagesByTripApi,
  listTripUsersApi
} from "../api/tripApi";
import SpendingForm from "../components/home/SpendingForm";
import StageForm from "../components/home/StageForm";
import {
  createEmptySpendingForm,
  createEmptyStageForm,
  formatAmount,
  formatStageDateTime,
  formatValue,
  getSpendingUsers
} from "../components/home/homeFormatters";
import { useSelector } from "react-redux";

const stageColors = ["#2563eb", "#dc2626", "#f59e0b", "#16a34a", "#7c3aed", "#0891b2"];

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

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || "Request failed.";

const getStageTimestamp = (stage) => {
  const date = new Date(stage?.startTime);
  return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
};

const getStageRange = (stage) =>
  `${formatStageDateTime(stage?.startTime)} to ${formatStageDateTime(stage?.endTime)}`;

export default function TripTimelineScreen({ route }) {
  const user = useSelector((state) => state.auth.user);
  const tripId = route?.params?.tripId;
  const fallbackTitle = route?.params?.title;
  const [trip, setTrip] = useState(null);
  const [stages, setStages] = useState([]);
  const [tripSpendings, setTripSpendings] = useState([]);
  const [stageSpendingsByStageId, setStageSpendingsByStageId] = useState({});
  const [stageForm, setStageForm] = useState(createEmptyStageForm());
  const [spendingFormsByKey, setSpendingFormsByKey] = useState({});
  const [selectedStageId, setSelectedStageId] = useState(null);
  const [visibleStageSpendingsId, setVisibleStageSpendingsId] = useState(null);
  const [activeTab, setActiveTab] = useState("stages");
  const [showStageForm, setShowStageForm] = useState(false);
  const [showTripSpendingForm, setShowTripSpendingForm] = useState(false);
  const [showStageSpendingForm, setShowStageSpendingForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spendingsLoading, setSpendingsLoading] = useState(false);
  const [stageSpendingsLoadingByStageId, setStageSpendingsLoadingByStageId] = useState({});
  const [createStageLoading, setCreateStageLoading] = useState(false);
  const [createTripSpendingLoading, setCreateTripSpendingLoading] = useState(false);
  const [createStageSpendingLoading, setCreateStageSpendingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [spendingsError, setSpendingsError] = useState(null);
  const [stageSpendingsErrorByStageId, setStageSpendingsErrorByStageId] = useState({});
  const [createStageError, setCreateStageError] = useState(null);
  const [createTripSpendingError, setCreateTripSpendingError] = useState(null);
  const [createStageSpendingError, setCreateStageSpendingError] = useState(null);
  const [spendingTypes, setSpendingTypes] = useState([]);
  const [spendingTypesLoading, setSpendingTypesLoading] = useState(false);
  const [spendingTypesError, setSpendingTypesError] = useState(null);
  const [tripUsers, setTripUsers] = useState([]);
  const [tripUsersLoading, setTripUsersLoading] = useState(false);
  const [tripUsersError, setTripUsersError] = useState(null);

  useEffect(() => {
    if (tripId == null) {
      setError("Missing trip id.");
      return;
    }

    let active = true;

    const loadTimeline = async () => {
      setLoading(true);
      setError(null);

      try {
        const [tripResponse, stagesResponse] = await Promise.all([
          getTripApi(tripId),
          listTripStagesByTripApi(tripId)
        ]);

        if (!active) {
          return;
        }

        const nextStages = getItems(stagesResponse).sort((left, right) => getStageTimestamp(left) - getStageTimestamp(right));

        setTrip(getEntity(tripResponse));
        setStages(nextStages);
        setSelectedStageId(nextStages[0]?.id ?? null);
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

    loadTimeline();

    return () => {
      active = false;
    };
  }, [tripId]);

  useEffect(() => {
    if (activeTab !== "spendings" || tripId == null || tripSpendings.length > 0) {
      return;
    }

    let active = true;

    const loadTripSpendings = async () => {
      setSpendingsLoading(true);
      setSpendingsError(null);

      try {
        const response = await listTripSpendingsWithoutStageApi(tripId);

        if (active) {
          setTripSpendings(getItems(response));
        }
      } catch (requestError) {
        if (active) {
          setSpendingsError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setSpendingsLoading(false);
        }
      }
    };

    loadTripSpendings();

    return () => {
      active = false;
    };
  }, [activeTab, tripId, tripSpendings.length]);

  const selectedStage = useMemo(
    () => stages.find((stage) => stage?.id === selectedStageId) || stages[0],
    [selectedStageId, stages]
  );
  const selectedStageSpendings = stageSpendingsByStageId[selectedStage?.id] || [];
  const selectedStageSpendingsLoading = stageSpendingsLoadingByStageId[selectedStage?.id] === true;
  const selectedStageSpendingsError = stageSpendingsErrorByStageId[selectedStage?.id];
  const showSelectedStageSpendings = visibleStageSpendingsId === selectedStage?.id;
  const tripSpendingFormKey = "trip";
  const stageSpendingFormKey = selectedStage?.id != null ? `stage-${selectedStage.id}` : "stage";

  const reloadStages = async () => {
    const response = await listTripStagesByTripApi(tripId);
    const nextStages = getItems(response).sort((left, right) => getStageTimestamp(left) - getStageTimestamp(right));

    setStages(nextStages);
    setSelectedStageId((current) => current ?? nextStages[0]?.id ?? null);
  };

  const reloadTripSpendings = async () => {
    const response = await listTripSpendingsWithoutStageApi(tripId);
    setTripSpendings(getItems(response));
  };

  const reloadStageSpendings = async (stageId) => {
    const response = await listTripSpendingsByStageApi(stageId);
    setStageSpendingsByStageId((current) => ({
      ...current,
      [stageId]: getItems(response)
    }));
  };

  const ensureSpendingOptions = async () => {
    if (spendingTypes.length === 0 && !spendingTypesLoading) {
      setSpendingTypesLoading(true);
      setSpendingTypesError(null);
      try {
        const response = await listTripSpendingTypesApi();
        setSpendingTypes(getItems(response));
      } catch (requestError) {
        setSpendingTypesError(getErrorMessage(requestError));
      } finally {
        setSpendingTypesLoading(false);
      }
    }

    if (tripUsers.length === 0 && !tripUsersLoading && tripId != null) {
      setTripUsersLoading(true);
      setTripUsersError(null);
      try {
        const response = await listTripUsersApi(tripId);
        setTripUsers(getItems(response));
      } catch (requestError) {
        setTripUsersError(getErrorMessage(requestError));
      } finally {
        setTripUsersLoading(false);
      }
    }
  };

  const toggleTripSpendingForm = () => {
    setShowTripSpendingForm((current) => !current);
    setSpendingFormsByKey((current) => ({
      ...current,
      [tripSpendingFormKey]: current[tripSpendingFormKey] || createEmptySpendingForm()
    }));
    ensureSpendingOptions();
  };

  const toggleStageSpendingForm = () => {
    setShowStageSpendingForm((current) => !current);
    setSpendingFormsByKey((current) => ({
      ...current,
      [stageSpendingFormKey]: current[stageSpendingFormKey] || createEmptySpendingForm()
    }));
    ensureSpendingOptions();
  };

  const setStageFormField = (_tripId, field, value) => {
    setStageForm((current) => ({
      ...current,
      [field]: value
    }));
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

  const toggleIncludedUser = (key, userId) => {
    setSpendingFormsByKey((current) => {
      const form = current[key] || createEmptySpendingForm();
      const selectedIds = Array.isArray(form.includedUserIds) ? form.includedUserIds : [];
      const nextIds = selectedIds.includes(userId)
        ? selectedIds.filter((selectedId) => selectedId !== userId)
        : [...selectedIds, userId];

      return {
        ...current,
        [key]: {
          ...form,
          includedUserIds: nextIds
        }
      };
    });
  };

  const getSelectedSpendingType = (form) => {
    if (form.tripSpendingType && (spendingTypes.length === 0 || spendingTypes.includes(form.tripSpendingType))) {
      return form.tripSpendingType;
    }

    return spendingTypes[0] || "VEHICLE";
  };

  const getSelectedPayerId = (form) => {
    if (form.userId != null && tripUsers.some((tripUser) => tripUser?.id === form.userId)) {
      return form.userId;
    }

    if (user?.id != null && tripUsers.some((tripUser) => tripUser?.id === user.id)) {
      return user.id;
    }

    return tripUsers[0]?.id ?? user?.id ?? null;
  };

  const buildSpendingPayload = (form) => ({
    name: form.name,
    amount: Number(form.amount),
    userId: getSelectedPayerId(form),
    tripSpendingType: getSelectedSpendingType(form),
    includedUserIds:
      Array.isArray(form.includedUserIds) && form.includedUserIds.length > 0
        ? form.includedUserIds
        : user?.id != null
          ? [user.id]
          : []
  });

  const createStage = async () => {
    if (tripId == null) {
      return;
    }

    setCreateStageLoading(true);
    setCreateStageError(null);
    try {
      await createTripStageApi({
        ...stageForm,
        tripId
      });
      setStageForm(createEmptyStageForm());
      await reloadStages();
    } catch (requestError) {
      setCreateStageError(getErrorMessage(requestError));
    } finally {
      setCreateStageLoading(false);
    }
  };

  const createTripSpending = async () => {
    if (tripId == null) {
      return;
    }

    const form = spendingFormsByKey[tripSpendingFormKey] || createEmptySpendingForm();

    setCreateTripSpendingLoading(true);
    setCreateTripSpendingError(null);
    try {
      await createTripSpendingApi({
        ...buildSpendingPayload(form),
        tripId
      });
      setSpendingFormsByKey((current) => ({
        ...current,
        [tripSpendingFormKey]: createEmptySpendingForm()
      }));
      await reloadTripSpendings();
    } catch (requestError) {
      setCreateTripSpendingError(getErrorMessage(requestError));
    } finally {
      setCreateTripSpendingLoading(false);
    }
  };

  const createStageSpending = async () => {
    const stageId = selectedStage?.id;

    if (tripId == null || stageId == null) {
      return;
    }

    const form = spendingFormsByKey[stageSpendingFormKey] || createEmptySpendingForm();

    setCreateStageSpendingLoading(true);
    setCreateStageSpendingError(null);
    try {
      await createTripSpendingApi({
        ...buildSpendingPayload(form),
        tripId,
        tripStageId: stageId
      });
      setSpendingFormsByKey((current) => ({
        ...current,
        [stageSpendingFormKey]: createEmptySpendingForm()
      }));
      setVisibleStageSpendingsId(stageId);
      await reloadStageSpendings(stageId);
    } catch (requestError) {
      setCreateStageSpendingError(getErrorMessage(requestError));
    } finally {
      setCreateStageSpendingLoading(false);
    }
  };

  const renderSpendingForm = ({ formKey, onSubmit, loading: formLoading, error: formError, submitLabel }) => {
    const form = spendingFormsByKey[formKey] || createEmptySpendingForm();
    const selectedUserIds = Array.isArray(form.includedUserIds) ? form.includedUserIds : [];

    return (
      <SpendingForm
        error={formError}
        form={form}
        formKey={formKey}
        getSelectedSpendingType={getSelectedSpendingType}
        loading={formLoading}
        onSubmit={onSubmit}
        selectedPayerId={getSelectedPayerId(form)}
        selectedUserIds={selectedUserIds}
        setSpendingFormField={setSpendingFormField}
        spendingTypes={spendingTypes}
        spendingTypesError={spendingTypesError}
        spendingTypesLoading={spendingTypesLoading}
        styles={styles}
        submitLabel={submitLabel}
        toggleIncludedUser={toggleIncludedUser}
        tripUsers={tripUsers}
        usersError={tripUsersError}
        usersLoading={tripUsersLoading}
      />
    );
  };

  const toggleSelectedStageSpendings = async () => {
    const stageId = selectedStage?.id;

    if (stageId == null) {
      return;
    }

    if (visibleStageSpendingsId === stageId) {
      setVisibleStageSpendingsId(null);
      return;
    }

    setVisibleStageSpendingsId(stageId);

    if (Object.prototype.hasOwnProperty.call(stageSpendingsByStageId, stageId)) {
      return;
    }

    setStageSpendingsLoadingByStageId((current) => ({
      ...current,
      [stageId]: true
    }));
    setStageSpendingsErrorByStageId((current) => ({
      ...current,
      [stageId]: null
    }));

    try {
      const response = await listTripSpendingsByStageApi(stageId);

      setStageSpendingsByStageId((current) => ({
        ...current,
        [stageId]: getItems(response)
      }));
    } catch (requestError) {
      setStageSpendingsErrorByStageId((current) => ({
        ...current,
        [stageId]: getErrorMessage(requestError)
      }));
    } finally {
      setStageSpendingsLoadingByStageId((current) => ({
        ...current,
        [stageId]: false
      }));
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.title}>
            {formatValue(trip?.title || fallbackTitle)}
          </Text>
          <Text style={styles.routeText}>
            {formatValue(trip?.startLocation)} - {formatValue(trip?.endLocation)}
          </Text>
        </Card.Content>
      </Card>

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <View style={styles.tabBar}>
        <Button
          icon={"map-marker-path"}
          mode={activeTab === "stages" ? "contained" : "outlined"}
          onPress={() => setActiveTab("stages")}
          loading={loading}
          disabled={tripId == null || loading}
          style={styles.tabButton}
        >
          Chặng
        </Button>
        <Button
          icon={"cash-multiple"}
          mode={activeTab === "spendings" ? "contained" : "outlined"}
          onPress={() => setActiveTab("spendings")}
          loading={spendingsLoading}
          disabled={tripId == null || spendingsLoading}
          style={styles.tabButton}
        >
          Chi tiêu chuyến đi
        </Button>
      </View>

      {activeTab === "stages" && loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator />
          <Text style={styles.mutedText}>Đang tải timeline...</Text>
        </View>
      ) : null}

      {activeTab === "stages" && !loading && stages.length === 0 ? (
        <Text style={styles.mutedText}>Không tìm thấy chặng nào cho chuyến đi này.</Text>
      ) : null}

      {activeTab === "stages" ? (
        <>
          <Button
            icon={showStageForm ? "chevron-up" : "plus"}
            mode="contained"
            onPress={() => setShowStageForm((current) => !current)}
            disabled={tripId == null}
            style={styles.fullWidthAction}
          >
            {showStageForm ? "Ẩn biểu mẫu chặng" : "Thêm chặng"}
          </Button>

          {showStageForm ? (
            <StageForm
              createStageError={createStageError}
              createStageLoading={createStageLoading}
              onCreateStage={createStage}
              setStageFormField={setStageFormField}
              stageForm={stageForm}
              styles={styles}
              tripId={tripId}
            />
          ) : null}
        </>
      ) : null}

      {activeTab === "stages" && stages.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timelineContent}
          >
            {stages.map((stage, index) => {
              const color = stageColors[index % stageColors.length];
              const selected = selectedStage?.id === stage?.id;

              return (
                <Pressable
                  key={stage?.id ?? `${stage?.name}-${index}`}
                  onPress={() => setSelectedStageId(stage?.id)}
                  style={styles.stageStep}
                >
                  <View style={[styles.stageLabelBox, selected && styles.selectedLabelBox]}>
                    <Text style={styles.stageName} numberOfLines={2}>
                      {formatValue(stage?.name)}
                    </Text>
                    <Text style={styles.stageTime}>{getStageRange(stage)}</Text>
                  </View>
                  <View style={styles.trackRow}>
                    <View style={[styles.trackLine, { backgroundColor: color }]} />
                    <View style={[styles.stageDot, { backgroundColor: color }]} />
                    <View style={[styles.stageDot, styles.endDot, { backgroundColor: color }]} />
                  </View>
                </Pressable>
              );
            })}
            <View style={styles.timelineTail}>
              <View style={styles.tailLine} />
              <View style={styles.tailDot} />
            </View>
          </ScrollView>

          {selectedStage ? (
            <Card style={styles.detailCard} onPress={toggleSelectedStageSpendings}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.detailTitle}>
                  {formatValue(selectedStage?.name)}
                </Text>
                <Text style={styles.detailMeta}>{getStageRange(selectedStage)}</Text>
                <Text style={styles.detailLocation}>{formatValue(selectedStage?.location)}</Text>
                <Text style={styles.detailActivity}>{formatValue(selectedStage?.activity)}</Text>
                <Text style={styles.detailHint}>
                  {showSelectedStageSpendings ? "Ẩn chi tiêu chặng" : "Nhấn để hiển thị chi tiêu chặng"}
                </Text>
              </Card.Content>
            </Card>
          ) : null}

          {selectedStage ? (
            <>
              <Button
                icon={showStageSpendingForm ? "chevron-up" : "plus"}
                mode="contained-tonal"
                onPress={toggleStageSpendingForm}
                disabled={selectedStage?.id == null}
                style={styles.fullWidthAction}
              >
                {showStageSpendingForm ? "Ẩn biểu mẫu chi tiêu chặng" : "Thêm chi tiêu chặng"}
              </Button>

              {showStageSpendingForm
                ? renderSpendingForm({
                  formKey: stageSpendingFormKey,
                  onSubmit: createStageSpending,
                  loading: createStageSpendingLoading,
                  error: createStageSpendingError,
                  submitLabel: "Tạo chi tiêu chặng"
                })
                : null}
            </>
          ) : null}

          {showSelectedStageSpendings ? (
            <View style={styles.stageSpendingsPanel}>
              <HelperText type="error" visible={!!selectedStageSpendingsError}>
                {selectedStageSpendingsError}
              </HelperText>

              {selectedStageSpendingsLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator />
                  <Text style={styles.mutedText}>Đang tải chi tiêu chặng...</Text>
                </View>
              ) : null}

              {!selectedStageSpendingsLoading && selectedStageSpendings.length === 0 ? (
                <Text style={styles.mutedText}>Không tìm thấy chi tiêu nào cho chặng này.</Text>
              ) : null}

              {selectedStageSpendings.map((spending, index) => (
                <View key={spending?.id ?? `stage-spending-${index}`} style={[styles.spendingCard, styles.stageSpendingCard]}>
                  <View style={styles.spendingHeader}>
                    <View style={[styles.spendingDot, styles.stageSpendingDot]} />
                    <Text variant="labelLarge" style={styles.spendingName}>
                      {formatValue(spending?.name)}
                    </Text>
                    <Text variant="labelLarge" style={styles.spendingAmount}>
                      {formatAmount(spending?.amount)}
                    </Text>
                  </View>
                  <Text style={styles.spendingMeta}>Kiểu chi: {formatValue(spending?.tripSpendingType)}</Text>
                  <Text style={styles.spendingMeta}>Người chi: {formatValue(spending?.user?.username)}</Text>
                  <Text style={styles.spendingMeta}>Bao gồm: {getSpendingUsers(spending)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      {activeTab === "spendings" ? (
        <View style={styles.spendingsPanel}>
          <Button
            icon={showTripSpendingForm ? "chevron-up" : "plus"}
            mode="contained-tonal"
            onPress={toggleTripSpendingForm}
            disabled={tripId == null}
            style={styles.fullWidthAction}
          >
            {showTripSpendingForm ? "Ẩn biểu mẫu chi tiêu chuyến đi" : "Thêm chi tiêu chuyến đi"}
          </Button>

          {showTripSpendingForm
            ? renderSpendingForm({
              formKey: tripSpendingFormKey,
              onSubmit: createTripSpending,
              loading: createTripSpendingLoading,
              error: createTripSpendingError,
              submitLabel: "Tạo chi tiêu chuyến đi"
            })
            : null}

          <HelperText type="error" visible={!!spendingsError}>
            {spendingsError}
          </HelperText>

          {spendingsLoading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.mutedText}>Đang tải chi tiêu chuyến đi...</Text>
            </View>
          ) : null}

          {!spendingsLoading && tripSpendings.length === 0 ? (
            <Text style={styles.mutedText}>Không tìm thấy chi tiêu nào cho chuyến đi này.</Text>
          ) : null}

          {tripSpendings.map((spending, index) => (
            <View key={spending?.id ?? `trip-spending-${index}`} style={styles.spendingCard}>
              <View style={styles.spendingHeader}>
                <View style={styles.spendingDot} />
                <Text variant="labelLarge" style={styles.spendingName}>
                  {formatValue(spending?.name)}
                </Text>
                <Text variant="labelLarge" style={styles.spendingAmount}>
                  {formatAmount(spending?.amount)}
                </Text>
              </View>
              <Text style={styles.spendingMeta}>Kiểu chi: {formatValue(spending?.tripSpendingType)}</Text>
              <Text style={styles.spendingMeta}>Người chi: {formatValue(spending?.user?.username)}</Text>
              <Text style={styles.spendingMeta}>Bao gồm: {getSpendingUsers(spending)}</Text>
            </View>
          ))}
        </View>
      ) : null}
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
  headerCard: {
    backgroundColor: "#ffffff",
    borderColor: "#dbe7f3",
    borderRadius: 8,
    borderWidth: 1
  },
  title: {
    color: "#12324f",
    fontWeight: "700"
  },
  routeText: {
    color: "#5a6b7b",
    marginTop: 4
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
  fullWidthAction: {
    marginTop: 12
  },
  sectionPanel: {
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12
  },
  sectionTitle: {
    fontWeight: "700",
    marginBottom: 6
  },
  formPanel: {
    backgroundColor: "#f8fafc",
    borderColor: "#cbd5e1"
  },
  formTitle: {
    color: "#334155"
  },
  selectorGroup: {
    marginTop: 10
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  loadingBox: {
    alignItems: "center",
    gap: 10,
    marginTop: 24
  },
  mutedText: {
    color: "#64748b",
    marginTop: 10
  },
  timelineContent: {
    alignItems: "flex-end",
    minHeight: 150,
    paddingHorizontal: 8,
    paddingTop: 28
  },
  stageStep: {
    width: 160
  },
  stageLabelBox: {
    borderColor: "transparent",
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
    minHeight: 76,
    padding: 8
  },
  selectedLabelBox: {
    backgroundColor: "#ffffff",
    borderColor: "#93c5fd"
  },
  stageName: {
    color: "#172033",
    fontWeight: "700"
  },
  stageTime: {
    color: "#172033",
    marginTop: 4
  },
  trackRow: {
    height: 28,
    justifyContent: "center",
    marginTop: 6
  },
  trackLine: {
    height: 2,
    width: "100%"
  },
  stageDot: {
    borderRadius: 999,
    height: 9,
    left: 0,
    position: "absolute",
    width: 9
  },
  endDot: {
    left: "100%",
    marginLeft: -9
  },
  timelineTail: {
    height: 28,
    justifyContent: "center",
    marginTop: 88,
    width: 100
  },
  tailLine: {
    backgroundColor: "#111827",
    height: 2,
    width: "100%"
  },
  tailDot: {
    backgroundColor: "#000000",
    borderRadius: 999,
    height: 9,
    position: "absolute",
    right: 0,
    width: 9
  },
  detailCard: {
    backgroundColor: "#ffffff",
    borderColor: "#bfdbfe",
    borderLeftColor: "#2563eb",
    borderLeftWidth: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18
  },
  detailTitle: {
    color: "#12324f",
    fontWeight: "700"
  },
  detailMeta: {
    color: "#2563eb",
    fontWeight: "700",
    marginTop: 6
  },
  detailLocation: {
    color: "#475569",
    marginTop: 8
  },
  detailActivity: {
    color: "#172033",
    marginTop: 8
  },
  detailHint: {
    color: "#64748b",
    marginTop: 10
  },
  spendingsPanel: {
    marginTop: 10
  },
  stageSpendingsPanel: {
    marginTop: 8
  },
  spendingCard: {
    backgroundColor: "#ffffff",
    borderColor: "#fdba74",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    padding: 12
  },
  spendingHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  spendingDot: {
    backgroundColor: "#ea580c",
    borderRadius: 999,
    height: 10,
    width: 10
  },
  stageSpendingCard: {
    borderColor: "#7dd3fc"
  },
  stageSpendingDot: {
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
  spendingMeta: {
    color: "#475569",
    marginTop: 6
  }
});
