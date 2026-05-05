import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  createTripSpendingApi,
  createTripStageApi,
  listMyTripsApi,
  listTripSpendingTypesApi,
  listTripSpendingsByStageApi,
  listTripSpendingsWithoutStageApi,
  listTripStagesByTripApi,
  listTripUsersApi
} from "../api/tripApi";
import { logout } from "./authSlice";

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

const getEntity = (response) => {
  if (response?.data && typeof response.data === "object" && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || "Could not load trips.";

export const fetchMyTrips = createAsyncThunk("trips/fetchMyTrips", async (_, { rejectWithValue }) => {
  try {
    const response = await listMyTripsApi();
    return getItems(response);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchTripStages = createAsyncThunk("trips/fetchTripStages", async (tripId, { rejectWithValue }) => {
  try {
    const response = await listTripStagesByTripApi(tripId);

    return {
      tripId,
      stages: getItems(response)
    };
  } catch (error) {
    return rejectWithValue({
      tripId,
      message: getErrorMessage(error)
    });
  }
});

export const createTripStageForTrip = createAsyncThunk(
  "trips/createTripStageForTrip",
  async ({ tripId, stage }, { dispatch, rejectWithValue }) => {
    try {
      const response = await createTripStageApi({
        ...stage,
        tripId
      });

      await dispatch(fetchTripStages(tripId));

      return {
        tripId,
        stage: getEntity(response)
      };
    } catch (error) {
      return rejectWithValue({
        tripId,
        message: getErrorMessage(error)
      });
    }
  }
);

export const fetchStageSpendings = createAsyncThunk(
  "trips/fetchStageSpendings",
  async (stageId, { rejectWithValue }) => {
    try {
      const response = await listTripSpendingsByStageApi(stageId);

      return {
        stageId,
        spendings: getItems(response)
      };
    } catch (error) {
      return rejectWithValue({
        stageId,
        message: getErrorMessage(error)
      });
    }
  }
);

export const fetchTripSpendingsWithoutStage = createAsyncThunk(
  "trips/fetchTripSpendingsWithoutStage",
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await listTripSpendingsWithoutStageApi(tripId);

      return {
        tripId,
        spendings: getItems(response)
      };
    } catch (error) {
      return rejectWithValue({
        tripId,
        message: getErrorMessage(error)
      });
    }
  }
);

export const fetchTripSpendingTypes = createAsyncThunk(
  "trips/fetchTripSpendingTypes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await listTripSpendingTypesApi();
      return getItems(response);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchTripUsers = createAsyncThunk("trips/fetchTripUsers", async (tripId, { rejectWithValue }) => {
  try {
    const response = await listTripUsersApi(tripId);

    return {
      tripId,
      users: getItems(response)
    };
  } catch (error) {
    return rejectWithValue({
      tripId,
      message: getErrorMessage(error)
    });
  }
});

export const createTripSpendingForTrip = createAsyncThunk(
  "trips/createTripSpendingForTrip",
  async ({ tripId, spending }, { dispatch, rejectWithValue }) => {
    try {
      const response = await createTripSpendingApi({
        ...spending,
        tripId
      });

      await dispatch(fetchTripSpendingsWithoutStage(tripId));

      return {
        key: `trip-${tripId}`,
        spending: getEntity(response)
      };
    } catch (error) {
      return rejectWithValue({
        key: `trip-${tripId}`,
        message: getErrorMessage(error)
      });
    }
  }
);

export const createTripSpendingForStage = createAsyncThunk(
  "trips/createTripSpendingForStage",
  async ({ tripId, stageId, spending }, { dispatch, rejectWithValue }) => {
    try {
      const response = await createTripSpendingApi({
        ...spending,
        tripId,
        tripStageId: stageId
      });

      await dispatch(fetchStageSpendings(stageId));

      return {
        key: `stage-${stageId}`,
        spending: getEntity(response)
      };
    } catch (error) {
      return rejectWithValue({
        key: `stage-${stageId}`,
        message: getErrorMessage(error)
      });
    }
  }
);

const tripsSlice = createSlice({
  name: "trips",
  initialState: {
    myTrips: [],
    stagesByTripId: {},
    stagesLoadingByTripId: {},
    stagesErrorByTripId: {},
    createStageLoadingByTripId: {},
    createStageErrorByTripId: {},
    spendingsByStageId: {},
    spendingsLoadingByStageId: {},
    spendingsErrorByStageId: {},
    spendingsWithoutStageByTripId: {},
    spendingsWithoutStageLoadingByTripId: {},
    spendingsWithoutStageErrorByTripId: {},
    createSpendingLoadingByKey: {},
    createSpendingErrorByKey: {},
    spendingTypes: [],
    spendingTypesLoading: false,
    spendingTypesError: null,
    usersByTripId: {},
    usersLoadingByTripId: {},
    usersErrorByTripId: {},
    loading: false,
    error: null
  },
  reducers: {
    clearTripsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTrips.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTrips.fulfilled, (state, action) => {
        state.loading = false;
        state.myTrips = action.payload;
      })
      .addCase(fetchMyTrips.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTripStages.pending, (state, action) => {
        const tripId = action.meta.arg;

        state.stagesLoadingByTripId[tripId] = true;
        state.stagesErrorByTripId[tripId] = null;
      })
      .addCase(fetchTripStages.fulfilled, (state, action) => {
        const { tripId, stages } = action.payload;

        state.stagesLoadingByTripId[tripId] = false;
        state.stagesByTripId[tripId] = stages;
      })
      .addCase(fetchTripStages.rejected, (state, action) => {
        const tripId = action.payload?.tripId ?? action.meta.arg;

        state.stagesLoadingByTripId[tripId] = false;
        state.stagesErrorByTripId[tripId] = action.payload?.message || "Could not load stages.";
      })
      .addCase(createTripStageForTrip.pending, (state, action) => {
        const tripId = action.meta.arg.tripId;

        state.createStageLoadingByTripId[tripId] = true;
        state.createStageErrorByTripId[tripId] = null;
      })
      .addCase(createTripStageForTrip.fulfilled, (state, action) => {
        const { tripId } = action.payload;

        state.createStageLoadingByTripId[tripId] = false;
      })
      .addCase(createTripStageForTrip.rejected, (state, action) => {
        const tripId = action.payload?.tripId ?? action.meta.arg.tripId;

        state.createStageLoadingByTripId[tripId] = false;
        state.createStageErrorByTripId[tripId] = action.payload?.message || "Could not create stage.";
      })
      .addCase(fetchStageSpendings.pending, (state, action) => {
        const stageId = action.meta.arg;

        state.spendingsLoadingByStageId[stageId] = true;
        state.spendingsErrorByStageId[stageId] = null;
      })
      .addCase(fetchStageSpendings.fulfilled, (state, action) => {
        const { stageId, spendings } = action.payload;

        state.spendingsLoadingByStageId[stageId] = false;
        state.spendingsByStageId[stageId] = spendings;
      })
      .addCase(fetchStageSpendings.rejected, (state, action) => {
        const stageId = action.payload?.stageId ?? action.meta.arg;

        state.spendingsLoadingByStageId[stageId] = false;
        state.spendingsErrorByStageId[stageId] = action.payload?.message || "Could not load spendings.";
      })
      .addCase(fetchTripSpendingsWithoutStage.pending, (state, action) => {
        const tripId = action.meta.arg;

        state.spendingsWithoutStageLoadingByTripId[tripId] = true;
        state.spendingsWithoutStageErrorByTripId[tripId] = null;
      })
      .addCase(fetchTripSpendingsWithoutStage.fulfilled, (state, action) => {
        const { tripId, spendings } = action.payload;

        state.spendingsWithoutStageLoadingByTripId[tripId] = false;
        state.spendingsWithoutStageByTripId[tripId] = spendings;
      })
      .addCase(fetchTripSpendingsWithoutStage.rejected, (state, action) => {
        const tripId = action.payload?.tripId ?? action.meta.arg;

        state.spendingsWithoutStageLoadingByTripId[tripId] = false;
        state.spendingsWithoutStageErrorByTripId[tripId] =
          action.payload?.message || "Could not load trip spendings.";
      })
      .addCase(fetchTripSpendingTypes.pending, (state) => {
        state.spendingTypesLoading = true;
        state.spendingTypesError = null;
      })
      .addCase(fetchTripSpendingTypes.fulfilled, (state, action) => {
        state.spendingTypesLoading = false;
        state.spendingTypes = action.payload;
      })
      .addCase(fetchTripSpendingTypes.rejected, (state, action) => {
        state.spendingTypesLoading = false;
        state.spendingTypesError = action.payload || "Could not load spending types.";
      })
      .addCase(fetchTripUsers.pending, (state, action) => {
        const tripId = action.meta.arg;

        state.usersLoadingByTripId[tripId] = true;
        state.usersErrorByTripId[tripId] = null;
      })
      .addCase(fetchTripUsers.fulfilled, (state, action) => {
        const { tripId, users } = action.payload;

        state.usersLoadingByTripId[tripId] = false;
        state.usersByTripId[tripId] = users;
      })
      .addCase(fetchTripUsers.rejected, (state, action) => {
        const tripId = action.payload?.tripId ?? action.meta.arg;

        state.usersLoadingByTripId[tripId] = false;
        state.usersErrorByTripId[tripId] = action.payload?.message || "Could not load trip users.";
      })
      .addCase(createTripSpendingForTrip.pending, (state, action) => {
        const key = `trip-${action.meta.arg.tripId}`;

        state.createSpendingLoadingByKey[key] = true;
        state.createSpendingErrorByKey[key] = null;
      })
      .addCase(createTripSpendingForTrip.fulfilled, (state, action) => {
        state.createSpendingLoadingByKey[action.payload.key] = false;
      })
      .addCase(createTripSpendingForTrip.rejected, (state, action) => {
        const key = action.payload?.key ?? `trip-${action.meta.arg.tripId}`;

        state.createSpendingLoadingByKey[key] = false;
        state.createSpendingErrorByKey[key] = action.payload?.message || "Could not create spending.";
      })
      .addCase(createTripSpendingForStage.pending, (state, action) => {
        const key = `stage-${action.meta.arg.stageId}`;

        state.createSpendingLoadingByKey[key] = true;
        state.createSpendingErrorByKey[key] = null;
      })
      .addCase(createTripSpendingForStage.fulfilled, (state, action) => {
        state.createSpendingLoadingByKey[action.payload.key] = false;
      })
      .addCase(createTripSpendingForStage.rejected, (state, action) => {
        const key = action.payload?.key ?? `stage-${action.meta.arg.stageId}`;

        state.createSpendingLoadingByKey[key] = false;
        state.createSpendingErrorByKey[key] = action.payload?.message || "Could not create spending.";
      })
      .addCase(logout.fulfilled, (state) => {
        state.myTrips = [];
        state.stagesByTripId = {};
        state.stagesLoadingByTripId = {};
        state.stagesErrorByTripId = {};
        state.createStageLoadingByTripId = {};
        state.createStageErrorByTripId = {};
        state.spendingsByStageId = {};
        state.spendingsLoadingByStageId = {};
        state.spendingsErrorByStageId = {};
        state.spendingsWithoutStageByTripId = {};
        state.spendingsWithoutStageLoadingByTripId = {};
        state.spendingsWithoutStageErrorByTripId = {};
        state.createSpendingLoadingByKey = {};
        state.createSpendingErrorByKey = {};
        state.spendingTypes = [];
        state.spendingTypesLoading = false;
        state.spendingTypesError = null;
        state.usersByTripId = {};
        state.usersLoadingByTripId = {};
        state.usersErrorByTripId = {};
        state.loading = false;
        state.error = null;
      });
  }
});

export const { clearTripsError } = tripsSlice.actions;
export default tripsSlice.reducer;
