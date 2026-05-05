import React from "react";
import { View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/authSlice";

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const roleNames = user?.authorities?.map((a) => a.authority)?.join(", ") || "-";

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineMedium">Welcome</Text>
          <Text style={{ marginTop: 8 }}>
            Username: {user?.username || "-"}
          </Text>
          <Text>
            Roles: {roleNames}
          </Text>

          <Button
            mode="contained"
            onPress={() => navigation.navigate("Profile")}
            style={{ marginTop: 16 }}
          >
            View Profile
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate("Trips")}
            style={{ marginTop: 12 }}
          >
            Trips
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate("TripStages")}
            style={{ marginTop: 12 }}
          >
            Trip Stages
          </Button>

          <Button
            mode="contained-tonal"
            onPress={() => navigation.navigate("TripSpendings")}
            style={{ marginTop: 12 }}
          >
            Trip Spendings
          </Button>

          <Button
            mode="outlined"
            onPress={() => dispatch(logout())}
            style={{ marginTop: 12 }}
          >
            Logout
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}
