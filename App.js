import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { Provider as PaperProvider, MD3LightTheme } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { store } from "./src/store/store";
import RootNavigator from "./src/navigation/RootNavigator";

const theme = {
  ...MD3LightTheme,
  roundness: 3
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}
