import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { formatValue } from "./homeFormatters";

export default function InfoPill({ label, value, tone = "neutral", styles }) {
  const isCustomValue = React.isValidElement(value);

  return (
    <View style={[styles.infoPill, styles[`${tone}Pill`]]}>
      <Text variant="labelSmall" style={[styles.infoPillLabel, styles[`${tone}PillLabel`]]}>
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
