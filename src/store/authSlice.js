import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginApi, profileApi, registerApi } from "../api/authApi";
import { getToken, removeToken, saveToken } from "../storage/tokenStorage";

const extractToken = (response) => {
  if (typeof response?.token === "string" && response.token.trim() !== "") {
    return response.token;
  }

  if (typeof response?.access_token === "string" && response.access_token.trim() !== "") {
    return response.access_token;
  }

  if (typeof response?.accessToken === "string" && response.accessToken.trim() !== "") {
    return response.accessToken;
  }

  if (typeof response?.data?.token === "string" && response.data.token.trim() !== "") {
    return response.data.token;
  }

  if (typeof response?.data?.access_token === "string" && response.data.access_token.trim() !== "") {
    return response.data.access_token;
  }

  if (typeof response?.data?.accessToken === "string" && response.data.accessToken.trim() !== "") {
    return response.data.accessToken;
  }

  return null;
};

const extractUser = (response) => {
  if (response?.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
};

export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async () => {
  const token = await getToken();

  if (!token) {
    return null;
  }

  const profileResponse = await profileApi();

  return {
    token,
    user: extractUser(profileResponse)
  };
});

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    const response = await loginApi(payload);
    const token = extractToken(response);

    if (!token) {
      return rejectWithValue("Login succeeded but no auth token was returned.");
    }

    await saveToken(token);

    const profileResponse = await profileApi();

    return {
      token,
      user: extractUser(profileResponse),
      message: response.message
    };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await registerApi(payload);
    const token = extractToken(response);

    if (!token) {
      return rejectWithValue("Register succeeded but no auth token was returned.");
    }

    await saveToken(token);

    const profileResponse = await profileApi();

    return {
      token,
      user: extractUser(profileResponse),
      message: response.message
    };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || e.message);
  }
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await removeToken();
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    user: null,
    loading: false,
    bootstrapping: true,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.bootstrapping = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.bootstrapping = false;
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.bootstrapping = false;
        state.token = null;
        state.user = null;
      })

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.error = null;
        state.loading = false;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
