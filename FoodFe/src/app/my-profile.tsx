import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
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
import * as ImagePicker from "expo-image-picker";

interface UserProfile {
  username: string;
  phone: string;
  avatar?: string;
  gender: "male" | "female" | "other";
  email: string;
}

const EditProfileScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    username: "",
    phone: "",
    avatar: "",
    gender: "other",
    email: "",
  });

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.status === 'success') {
        const userData = response.data.user;
        setProfile({
          username: userData.username || "",
          phone: userData.phone || "",
          avatar: userData.avatar || "",
          gender: userData.gender || "other",
          email: userData.userLogin || "", // Backend uses userLogin as email
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Lỗi", "Không thể tải thông tin profile");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfile(prev => ({ ...prev, avatar: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Cần quyền truy cập camera");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfile(prev => ({ ...prev, avatar: result.assets[0].uri }));
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chụp ảnh");
    }
  };

  const showImagePicker = () => {
    Alert.alert(
      "Chọn ảnh đại diện",
      "Bạn muốn chọn ảnh từ thư viện hay chụp ảnh mới?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Thư viện", onPress: pickImage },
        { text: "Chụp ảnh", onPress: takePhoto },
      ]
    );
  };

  const handleSave = async () => {
    if (!profile.username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên người dùng");
      return;
    }

    if (!profile.phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      
      // Update profile - send all supported fields
      const updateResponse = await axios.put(
        `${API_BASE_URL}/api/users/profile`,
        {
          username: profile.username,
          phone: profile.phone,
          avatar: profile.avatar, 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (updateResponse.data.status === 'success') {
        Alert.alert("Thành công", "Cập nhật profile thành công!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Lỗi", 
        error.response?.data?.message || "Không thể cập nhật profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff9800" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={showImagePicker} style={styles.avatarContainer}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#ccc" />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Nhấn để thay đổi ảnh đại diện</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tên người dùng *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={profile.username}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, username: text }))}
                  placeholder="Nhập tên người dùng"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputContainer, styles.disabledInput]}>
                <Ionicons name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <Text style={styles.disabledText}>{profile.email || "Chưa có email"}</Text>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={profile.phone}
                  onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Giới tính</Text>
              <View style={styles.genderContainer}>
                {[
                  { value: "male", label: "Nam", icon: "male" },
                  { value: "female", label: "Nữ", icon: "female" },
                  { value: "other", label: "Khác", icon: "person" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      profile.gender === option.value && styles.genderOptionSelected,
                    ]}
                    onPress={() => setProfile(prev => ({ ...prev, gender: option.value as any }))}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={profile.gender === option.value ? "#fff" : "#666"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.genderText,
                        profile.gender === option.value && styles.genderTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity 
                onPress={handleSave} 
                style={styles.saveButton}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
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
  
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#ff9800",
  },
  
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e9ecef",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#ff9800",
  },
  
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ff9800",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  avatarHint: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
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
  
  disabledInput: {
    backgroundColor: "#f1f3f4",
    borderColor: "#dee2e6",
  },
  
  disabledText: {
    flex: 1,
    fontSize: 16,
    color: "#6c757d",
  },
  
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  
  genderOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginHorizontal: 6,
  },
  
  genderOptionSelected: {
    backgroundColor: "#ff9800",
    borderColor: "#ff9800",
  },
  
  genderText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
  },
  
  genderTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  
  saveButtonContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  
  saveButton: {
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
  
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
});

export default EditProfileScreen;
