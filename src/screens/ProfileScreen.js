import React, { useState } from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useSelector } from "react-redux";
import { profileApi } from "../api/authApi";

const extractUser = (response) => {
  if (response?.data && typeof response.data === "object") {
    return response.data;
  }

  return response;
};

export default function ProfileScreen() {
  const storedUser = useSelector((state) => state.auth.user);
  const [profile, setProfile] = useState(storedUser);
  const [loading, setLoading] = useState(false);

  const reloadProfile = async () => {
    setLoading(true);
    try {
      const response = await profileApi();
      setProfile(extractUser(response));
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading === true;
  const roleNames = profile?.authorities?.map((a) => a.authority)?.join(", ") || "-";

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineMedium">Profile</Text>

          <Text style={{ marginTop: 12 }}>
            Username: {profile?.username || "-"}
          </Text>

          <Text>
            Roles: {roleNames}
          </Text>

          <Button
            mode="contained"
            onPress={reloadProfile}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: 16 }}
          >
            Reload Profile
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}
