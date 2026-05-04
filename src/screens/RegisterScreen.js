import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Card, HelperText, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import { clearError, register } from "../store/authSlice";

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("thai27");
  const [password, setPassword] = useState("abccd1234");
  const [role, setRole] = useState("USER");

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleRegister = () => {
    dispatch(register({ username, password, role }));
  };

  // Ensure values are proper types
  const isLoading = loading === true;
  const errorMessage = typeof error === "string" ? error : null;

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Card>
        <Card.Content>
          <Text variant="headlineMedium" style={{ marginBottom: 16 }}>
            Register
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
            style={{ marginBottom: 12 }}
          />

          <SegmentedButtons
            value={role}
            onValueChange={setRole}
            buttons={[
              { value: "USER", label: "User" },
              { value: "MODDER", label: "Mod" },
              { value: "ADMIN", label: "Admin" }
            ]}
            style={{ marginBottom: 6 }}
          />

          <HelperText type="error" visible={!!errorMessage}>
            {errorMessage}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginTop: 8 }}
          >
            Register
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={{ marginTop: 8 }}
          >
            Back to login
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}
