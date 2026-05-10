import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import DetailRow from "./DetailRow";
import { formatAmount, formatValue, getSpendingUsers } from "./homeFormatters";

export default function SpendingCard({ spending, tone = "trip", styles }) {
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
        <DetailRow label="Type" value={spending?.tripSpendingType} styles={styles} />
        <DetailRow label="Paid by" value={spending?.user?.username} styles={styles} />
        <DetailRow label="Included" value={getSpendingUsers(spending)} styles={styles} />
      </View>
    </View>
  );
}
