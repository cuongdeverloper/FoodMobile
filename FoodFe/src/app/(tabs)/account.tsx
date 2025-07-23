import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCurrentApp } from "@/context/app.context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

type IonIconName = keyof typeof Ionicons.glyphMap;

type AccountButtonProps = {
  icon: IonIconName;
  label: string;
  onPress: () => void;
  badge?: number;
  color?: string;
};

const AccountButton = ({ icon, label, onPress, badge, color = "#2c3e50" }: AccountButtonProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      <Ionicons name={icon} size={20} color={color} style={styles.menuIcon} />
      <Text style={[styles.menuText, { color }]}>{label}</Text>
    </View>
    <View style={styles.menuItemRight}>
      {badge !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color="#ccc" />
    </View>
  </TouchableOpacity>
);

const AccountScreen = () => {
  const { appState } = useCurrentApp();
  const router = useRouter();
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.status === 'success') {
          const userData = response.data.user;
          if (userData.avatar) {
            // If avatar is a local file URI, use it directly
            if (userData.avatar.startsWith('file://')) {
              setUserAvatar(userData.avatar);
            } else {
              // If it's a server URL, construct the full URL
              setUserAvatar(`${API_BASE_URL}/uploads/${userData.avatar}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Gradient Header */}
        <LinearGradient
          colors={["#ff9800", "#f57c00"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileContainer}>
            {loading ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={{
                  uri: "https://img.freepik.com/premium-vector/user-avatar-vector_1104560-4.jpg",
                }}
                style={styles.avatar}
              />
            )}
            <Text style={styles.name}>{appState?.username}</Text>
          </View>
        </LinearGradient>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {/* My Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Account</Text>
            <View style={styles.sectionContent}>
              <AccountButton 
                icon="person-outline" 
                label="Information & Contact" 
                onPress={() => router.push("/my-profile")} 
              />
              <AccountButton 
                icon="lock-closed-outline" 
                label="Password" 
                onPress={() => router.push("/changePassword")} 
              />
            </View>
          </View>

          {/* App Features Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Features</Text>
            <View style={styles.sectionContent}>
              <AccountButton 
                icon="mail-outline" 
                label="Notifications" 
                badge={7} 
                onPress={() => router.push("/notification")} 
              />
              <AccountButton 
                icon="heart-outline" 
                label="Favourites" 
                onPress={() => router.push("/favourite")} 
              />
              <AccountButton 
                icon="location-outline" 
                label="Address" 
                onPress={() => router.push("/address-management")} 
              />
              <AccountButton 
                icon="settings-outline" 
                label="Settings" 
                onPress={() => router.push("/settings")} 
              />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountScreen;

// 🎨 CSS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
  },
  header: {
   // borderBottomLeftRadius: 40,
   // borderBottomRightRadius: 40,
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 12,
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  role: {
    fontSize: 14,
    color: "#eee",
  },
  menuContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  
  section: {
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  menuIcon: {
    marginRight: 12,
  },
  
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  badge: {
    backgroundColor: "#ff9800",
    paddingHorizontal: 8,
    borderRadius: 10,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
    height: 24,
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  }
});
