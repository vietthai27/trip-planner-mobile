import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

export default function SectionPanel({ title, tone = "neutral", children, styles }) {
  return (
    <View style={[styles.sectionPanel, styles[`${tone}Panel`]]}>
      <Text variant="labelLarge" style={[styles.sectionTitle, styles[`${tone}Title`]]}>
        {title}
      </Text>
      {children}
    </View>
  );
}
