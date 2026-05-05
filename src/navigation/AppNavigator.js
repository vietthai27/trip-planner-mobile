import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TripSpendingsScreen from "../screens/TripSpendingsScreen";
import TripStagesScreen from "../screens/TripStagesScreen";
import TripsScreen from "../screens/TripsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Trip Planner" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
      <Stack.Screen name="Trips" component={TripsScreen} options={{ title: "Trips" }} />
      <Stack.Screen name="TripStages" component={TripStagesScreen} options={{ title: "Trip Stages" }} />
      <Stack.Screen name="TripSpendings" component={TripSpendingsScreen} options={{ title: "Trip Spendings" }} />
    </Stack.Navigator>
  );
}
