import React from "react";
import { Button, HelperText, TextInput } from "react-native-paper";
import DateTimeField from "./DateTimeField";
import SectionPanel from "./SectionPanel";

export default function StageForm({
  createStageError,
  createStageLoading,
  onCreateStage,
  setStageFormField,
  stageForm,
  styles,
  tripId
}) {
  return (
    <SectionPanel title="Chặng mới" tone="form" styles={styles}>
      <TextInput
        label="Tên chặng"
        value={stageForm.name}
        onChangeText={(value) => setStageFormField(tripId, "name", value)}
        mode="outlined"
      />
      <DateTimeField
        label="Thời gian bắt đầu"
        value={stageForm.startTime}
        onChange={(value) => setStageFormField(tripId, "startTime", value)}
      />
      <DateTimeField
        label="Thời gian kết thúc"
        value={stageForm.endTime}
        onChange={(value) => setStageFormField(tripId, "endTime", value)}
      />
      <TextInput
        label="Địa điểm"
        value={stageForm.location}
        onChangeText={(value) => setStageFormField(tripId, "location", value)}
        mode="outlined"
        style={{ marginTop: 10 }}
      />
      <TextInput
        label="Hoạt động"
        value={stageForm.activity}
        onChangeText={(value) => setStageFormField(tripId, "activity", value)}
        mode="outlined"
        multiline
        style={{ marginTop: 10 }}
      />

      <HelperText type="error" visible={!!createStageError}>
        {createStageError}
      </HelperText>

      <Button
        icon="check"
        mode="contained"
        onPress={onCreateStage}
        loading={createStageLoading}
        disabled={createStageLoading}
        style={{ marginTop: 4 }}
      >
        Tạo chặng
      </Button>
    </SectionPanel>
  );
}
