import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  const handleChangePassword = async () => {
    // Validation
    if (!passwords.currentPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (!passwords.newPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu mới");
      return;
    }

    if (passwords.newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      
      const response = await axios.put(
        `${API_BASE_URL}/api/users/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.status === 'success') {
        Alert.alert("Thành công", "Đổi mật khẩu thành công!", [
          { text: "OK", onPress: () => router.back() }
        ]);
        // Clear form
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      Alert.alert(
        "Lỗi", 
        error.response?.data?.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra mật khẩu hiện tại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoIcon}>
              <Ionicons name="lock-closed" size={32} color="#ff9800" />
            </View>
            <Text style={styles.infoTitle}>Bảo mật tài khoản</Text>
            <Text style={styles.infoText}>
              Đổi mật khẩu để bảo vệ tài khoản của bạn. Mật khẩu mới phải có ít nhất 6 ký tự.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu hiện tại *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={passwords.currentPassword}
                  onChangeText={(text) => setPasswords(prev => ({ ...prev, currentPassword: text }))}
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor="#999"
                  secureTextEntry={!showCurrentPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showCurrentPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={passwords.newPassword}
                  onChangeText={(text) => setPasswords(prev => ({ ...prev, newPassword: text }))}
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor="#999"
                  secureTextEntry={!showNewPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu mới *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={passwords.confirmPassword}
                  onChangeText={(text) => setPasswords(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={passwords.newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={passwords.newPassword.length >= 6 ? "#4CAF50" : "#999"} 
                />
                <Text style={styles.requirementText}>Ít nhất 6 ký tự</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={passwords.newPassword === passwords.confirmPassword && passwords.newPassword.length > 0 ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={passwords.newPassword === passwords.confirmPassword && passwords.newPassword.length > 0 ? "#4CAF50" : "#999"} 
                />
                <Text style={styles.requirementText}>Mật khẩu xác nhận khớp</Text>
              </View>
            </View>

            {/* Change Password Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={handleChangePassword} 
                style={styles.changePasswordButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.changePasswordButtonText}>Đổi mật khẩu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },
  
  scrollView: {
    flex: 1,
  },
  
  infoSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  
  infoIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff3e0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#ff9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
  },
  
  infoText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  
  formContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  inputGroup: {
    marginBottom: 24,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  
  inputIcon: {
    marginRight: 12,
  },
  
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2c3e50",
  },
  
  eyeButton: {
    padding: 4,
  },
  
  requirementsContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  
  requirementText: {
    fontSize: 14,
    color: "#6c757d",
    marginLeft: 8,
  },
  
  buttonContainer: {
    alignItems: "center",
  },
  
  changePasswordButton: {
    backgroundColor: "#ff9800",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ff9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  changePasswordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default ChangePasswordScreen; 