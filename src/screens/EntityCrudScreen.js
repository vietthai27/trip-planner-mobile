import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Button, Card, Divider, HelperText, Text, TextInput } from "react-native-paper";
import { useSelector } from "react-redux";

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

const toInputValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (value == null) {
    return "";
  }

  return String(value);
};

const getUserId = (user) => user?.id ?? user?.userId ?? user?.accountId ?? "";

const resolveDefault = (field, user) => {
  if (typeof field.defaultValue === "function") {
    return field.defaultValue(user);
  }

  return field.defaultValue ?? "";
};

const buildInitialForm = (fields, user) =>
  fields.reduce((acc, field) => {
    acc[field.name] = toInputValue(resolveDefault(field, user));
    return acc;
  }, {});

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

const buildPayload = (fields, form) =>
  fields.reduce((acc, field) => {
    const value = form[field.name];

    if (field.type === "number") {
      acc[field.name] = parseNumber(value);
      return acc;
    }

    if (field.type === "numberArray") {
      acc[field.name] = parseNumberArray(value);
      return acc;
    }

    acc[field.name] = value;
    return acc;
  }, {});

const getErrorMessage = (error) => error?.response?.data?.message || error?.message || "Request failed.";

const getRecordId = (item) => item?.id ?? item?.tripId ?? item?.tripStageId ?? item?.tripSpendingId;

export default function EntityCrudScreen({ config }) {
  const user = useSelector((state) => state.auth.user);
  const initialForm = useMemo(() => buildInitialForm(config.fields, user), [config.fields, user]);

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [lookupId, setLookupId] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = useCallback(() => {
    setEditingId(null);
    setForm(initialForm);
  }, [initialForm]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await config.api.list();
      setItems(getItems(response));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [config.api]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const editItem = (item) => {
    const entity = getEntity(item);
    const nextForm = config.fields.reduce((acc, field) => {
      acc[field.name] = toInputValue(entity?.[field.name] ?? resolveDefault(field, user));
      return acc;
    }, {});

    setEditingId(getRecordId(entity));
    setForm(nextForm);
  };

  const loadById = async () => {
    const id = lookupId.trim();

    if (!id) {
      setError("Enter an ID to load.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await config.api.get(id);
      editItem(getEntity(response));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(config.fields, form);

      if (editingId == null) {
        await config.api.create(payload);
      } else {
        await config.api.update(editingId, payload);
      }

      resetForm();
      await loadItems();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = (item) => {
    const id = getRecordId(item);

    if (id == null) {
      setError("Cannot delete this item because it has no ID.");
      return;
    }

    Alert.alert(`Delete ${config.singular}`, "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          setError(null);
          try {
            await config.api.delete(id);
            if (editingId === id) {
              resetForm();
            }
            await loadItems();
          } catch (e) {
            setError(getErrorMessage(e));
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const isBusy = loading || saving;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text variant="headlineSmall">{config.title}</Text>
      <Text style={{ marginTop: 4, color: "#59616d" }}>{config.subtitle}</Text>

      <Card style={{ marginTop: 16 }}>
        <Card.Content>
          <Text variant="titleMedium">{editingId == null ? `Create ${config.singular}` : `Edit ${config.singular} #${editingId}`}</Text>

          {config.fields.map((field) => (
            <TextInput
              key={field.name}
              label={field.label}
              value={form[field.name]}
              onChangeText={(value) => setField(field.name, value)}
              mode="outlined"
              keyboardType={field.keyboardType || (field.type === "number" ? "numeric" : "default")}
              autoCapitalize="none"
              multiline={field.multiline === true}
              style={{ marginTop: 12 }}
            />
          ))}

          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Button mode="contained" onPress={save} loading={saving} disabled={isBusy} style={{ flex: 1 }}>
              {editingId == null ? "Create" : "Update"}
            </Button>
            <Button mode="outlined" onPress={resetForm} disabled={isBusy} style={{ flex: 1 }}>
              Clear
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Card.Content>
          <Text variant="titleMedium">Load By ID</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TextInput
              label={`${config.singular} ID`}
              value={lookupId}
              onChangeText={setLookupId}
              mode="outlined"
              keyboardType="numeric"
              style={{ flex: 1 }}
            />
            <Button mode="contained-tonal" onPress={loadById} loading={loading} disabled={isBusy} style={{ alignSelf: "center" }}>
              Load
            </Button>
          </View>
        </Card.Content>
      </Card>

      {config.renderExtra?.({ isBusy, setError })}

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
        <Text variant="titleMedium" style={{ flex: 1 }}>
          Records
        </Text>
        <Button mode="text" onPress={loadItems} loading={loading} disabled={isBusy}>
          Refresh
        </Button>
      </View>

      {items.length === 0 ? (
        <Text style={{ marginTop: 10, color: "#59616d" }}>{loading ? "Loading..." : "No records found."}</Text>
      ) : (
        items.map((item, index) => {
          const id = getRecordId(item) ?? index;
          return (
            <Card key={`${id}-${index}`} style={{ marginTop: 10 }}>
              <Card.Content>
                <Text variant="titleMedium">{config.getTitle(item)}</Text>
                {config.getDetails(item).map((line) => (
                  <Text key={line} style={{ marginTop: 3, color: "#59616d" }}>
                    {line}
                  </Text>
                ))}
                <Divider style={{ marginVertical: 12 }} />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Button mode="contained-tonal" onPress={() => editItem(item)} disabled={isBusy} style={{ flex: 1 }}>
                    Edit
                  </Button>
                  <Button mode="outlined" onPress={() => deleteItem(item)} disabled={isBusy} style={{ flex: 1 }}>
                    Delete
                  </Button>
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

export { getUserId };
