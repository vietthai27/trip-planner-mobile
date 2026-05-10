export const createEmptyStageForm = () => ({
  name: "",
  startTime: "",
  endTime: "",
  location: "",
  activity: ""
});

export const createEmptySpendingForm = () => ({
  name: "",
  amount: "",
  userId: null,
  tripSpendingType: "VEHICLE",
  includedUserIds: []
});

export const formatValue = (value) => {
  if (value == null || value === "") {
    return "-";
  }

  return String(value);
};

export const getTripUsers = (trip) => {
  if (!Array.isArray(trip?.users) || trip.users.length === 0) {
    return "-";
  }

  return trip.users.map((user) => user?.username).filter(Boolean).join(", ") || "-";
};

export function formatDateTimeText(isoString) {
  const date = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export const getSpendingUsers = (spending) => {
  if (!Array.isArray(spending?.includedUsers) || spending.includedUsers.length === 0) {
    return "-";
  }

  return spending.includedUsers.map((user) => user?.username).filter(Boolean).join(", ") || "-";
};

export const formatAmount = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return formatValue(value);
  }

  return amount.toLocaleString("vi-VN");
};

export const formatStageDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return formatValue(value);
  }

  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const getStageTime = (stage) =>
  `${formatStageDateTime(stage?.startTime)} to ${formatStageDateTime(stage?.endTime)}`;

export const toPickerDate = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
};

export const formatDateTime = (value) => {
  if (!value) {
    return "Select date and time";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

export const toDateTimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = toPickerDate(value);
  const timezoneOffset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

export const fromDateTimeLocalValue = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
};
