import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { formatValue } from "./homeFormatters";

export default function DetailRow({ label, value, styles }) {
  return (
    <View style={styles.detailRow}>
      <Text variant="labelMedium" style={styles.detailLabel}>
        {label}
      </Text>
      <Text style={styles.detailValue}>{formatValue(value)}</Text>
    </View>
  );
}
