import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { clearError, login } from "../store/authSlice";

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("thai27");
  const [password, setPassword] = useState("abccd1234");

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleLogin = () => {
    dispatch(login({ username, password }));
  };

  // Ensure values are proper types
  const isLoading = loading === true;
  const errorMessage = typeof error === "string" ? error : null;

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
            Login
          </Text>

          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            mode="outlined"
            autoCapitalize="none"
            style={{ marginBottom: 12 }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={{ marginBottom: 6 }}
          />

          <HelperText type="error" visible={!!errorMessage}>
            {errorMessage}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            Login
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 8 }}
          >
            Create new account
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}
