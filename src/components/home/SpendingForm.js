import React from "react";
import { View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import SectionPanel from "./SectionPanel";

export default function SpendingForm({
  error,
  form,
  formKey,
  getSelectedSpendingType,
  loading,
  onSubmit,
  selectedPayerId,
  selectedUserIds,
  setSpendingFormField,
  spendingTypes,
  spendingTypesError,
  spendingTypesLoading,
  styles,
  submitLabel,
  toggleIncludedUser,
  tripUsers,
  usersError,
  usersLoading
}) {
  const selectedType = getSelectedSpendingType(form);

  return (
    <SectionPanel title="Chi tiêu mới" tone="form" styles={styles}>
      <TextInput
        label="Tên chi tiêu"
        value={form.name}
        onChangeText={(value) => setSpendingFormField(formKey, "name", value)}
        mode="outlined"
      />
      <TextInput
        label="Số tiền"
        value={form.amount}
        onChangeText={(value) => setSpendingFormField(formKey, "amount", value)}
        mode="outlined"
        keyboardType="numeric"
        style={{ marginTop: 10 }}
      />
      <View style={styles.selectorGroup}>
        <Text style={{ color: "#59616d", marginBottom: 6 }}>Người chi</Text>
        {usersLoading ? <Text style={{ color: "#59616d" }}>Đang tải người dùng...</Text> : null}
        <HelperText type="error" visible={!!usersError}>
          {usersError}
        </HelperText>
        {tripUsers.length === 0 && !usersLoading ? (
          <Text style={{ color: "#59616d" }}>Không tìm thấy người dùng nào cho chuyến đi này.</Text>
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
        <Text style={{ color: "#59616d", marginBottom: 6 }}>Người tham gia</Text>
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
        <Text style={{ color: "#59616d", marginBottom: 6 }}>Loại chi tiêu</Text>
        {spendingTypesLoading ? (
          <Text style={{ color: "#59616d" }}>Đang tải loại chi tiêu...</Text>
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
}
