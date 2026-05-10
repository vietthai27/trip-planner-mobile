import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Menu, Text } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TripFormScreen from "../screens/TripFormScreen";
import TripSpendingsScreen from "../screens/TripSpendingsScreen";
import TripStagesScreen from "../screens/TripStagesScreen";
import TripTimelineScreen from "../screens/TripTimelineScreen";
import { logout } from "../store/authSlice";

const Stack = createNativeStackNavigator();

function HeaderTitle({ username }) {
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = () => {
    closeMenu();
    dispatch(logout());
  };

  return (
    <View style={styles.headerTitle}>
      <View style={styles.headerText}>
        <Text variant="labelSmall" numberOfLines={1} style={styles.username}>
          {username || "Guest"}
        </Text>
      </View>
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Pressable
            accessibilityLabel="Open account menu"
            accessibilityRole="button"
            hitSlop={8}
            onPress={openMenu}
            style={styles.logo}
          >
            <Text style={styles.logoText}>AD</Text>
          </Pressable>
        }
      >
        <Menu.Item onPress={handleLogout} title="Logout" />
      </Menu>
    </View>
  );
}

export default function AppNavigator() {
  const username = useSelector((state) => state.auth.user?.username);

  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <HeaderTitle username={username} />
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Trip Planner" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="AddTrip" component={TripFormScreen} options={{ title: "Add Trip" }} />
      <Stack.Screen name="EditTrip" component={TripFormScreen} options={{ title: "Edit Trip" }} />
      <Stack.Screen name="TripTimeline" component={TripTimelineScreen} options={{ title: "Trip Timeline" }} />
      <Stack.Screen name="TripStages" component={TripStagesScreen} options={{ title: "Trip Stages" }} />
      <Stack.Screen name="TripSpendings" component={TripSpendingsScreen} options={{ title: "Trip Spendings" }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    maxWidth: 180,
    padding: 5
  },
  logo: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  logoText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700"
  },
  headerText: {
    flexShrink: 1,
    alignItems: "flex-end"
  },
  username: {
    color: "#4b5563",
    lineHeight: 14
  }
});
