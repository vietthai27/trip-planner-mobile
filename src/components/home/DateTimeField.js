import React, { useState } from "react";
import { Platform, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { Button, Text } from "react-native-paper";
import {
  formatDateTime,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
  toPickerDate
} from "./homeFormatters";

export default function DateTimeField({ label, value, onChange }) {
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
        <Button mode="outlined" onPress={() => openPicker("date")} style={{ flex: 1 }}>
          {formatDateTime(value)}
        </Button>
        <Button mode="contained-tonal" onPress={() => openPicker("time")}>
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
