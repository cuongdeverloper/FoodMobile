import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCurrentApp } from "@/context/app.context";
import { LinearGradient } from "expo-linear-gradient";

interface SettingsItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  value?: string;
  showArrow?: boolean;
}

const SettingsItem = ({ icon, label, onPress, value, showArrow = true }: SettingsItemProps) => (
  <TouchableOpacity style={styles.settingsItem} onPress={onPress}>
    <View style={styles.settingsItemLeft}>
      <Ionicons name={icon as any} size={20} color="#ff9800" style={styles.settingsIcon} />
      <Text style={styles.settingsText}>{label}</Text>
    </View>
    <View style={styles.settingsItemRight}>
      {value && <Text style={styles.settingsValue}>{value}</Text>}
      {showArrow && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
    </View>
  </TouchableOpacity>
);

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const SettingsScreen = () => {
  const router = useRouter();
  const { setAppState } = useCurrentApp();

  const handleLogout = async () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              // Clear all stored data
              await AsyncStorage.multiRemove([
                "access_token",
                "refresh_token",
                "user_id",
                "username",
                "userLogin",
                "default_address",
                "user_addresses"
              ]);

              // Reset app state
              setAppState({
                access_token: null,
                refresh_token: null,
                user_id: null,
                username: null,
                userLogin: null,
              });

              // Navigate to welcome screen
              router.replace("/auth/welcome");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.");
            }
          },
        },
      ]
    );
  };

  const handlePaymentMethod = () => {
    console.log("Payment Method pressed");
    // Navigate to payment method screen
  };

  const handleContactUs = () => {
    console.log("Contact Us pressed");
    // Navigate to contact us screen
  };

  const handleHelpFAQs = () => {
    console.log("Help & FAQs pressed");
    // Navigate to help & FAQs screen
  };

  const handleChangeLanguage = () => {
    console.log("Change Language pressed");
    // Navigate to language selection screen
  };

  const handleNotificationSettings = () => {
    console.log("Notification Settings pressed");
    // Navigate to notification settings screen
  };

  const handlePrivacyPolicy = () => {
    console.log("Privacy Policy pressed");
    // Navigate to privacy policy screen
  };

  const handleRegulation = () => {
    console.log("Regulation pressed");
    // Navigate to regulation screen
  };

  const handleTermsOfService = () => {
    console.log("Terms of Service pressed");
    // Navigate to terms of service screen
  };

  const handleDisputeResolution = () => {
    console.log("Dispute Resolution Policy pressed");
    // Navigate to dispute resolution screen
  };

  const handleRequestAccountDeletion = () => {
    console.log("Request Account Deletion pressed");
    // Navigate to account deletion request screen
  };

  const handleAboutUs = () => {
    console.log("About Us pressed");
    // Navigate to about screen
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Gradient Header */}
        <LinearGradient
          colors={["#ff9800", "#f57c00"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Settings</Text>
            </View>
            {/* <View style={styles.backButton} /> */}
          </View>
        </LinearGradient>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* APP Settings */}
          <SettingsSection title="APP Settings">
            <SettingsItem
              icon="language-outline"
              label="Change language"
              value="English"
              onPress={handleChangeLanguage}
            />
            <SettingsItem
              icon="notifications-outline"
              label="Notification Settings"
              onPress={handleNotificationSettings}
            />
          </SettingsSection>

          {/* Payment & Support */}
          <SettingsSection title="Payment & Support">
            <SettingsItem
              icon="card-outline"
              label="Payment Method"
              onPress={handlePaymentMethod}
            />
            <SettingsItem
              icon="call-outline"
              label="Contact Us"
              onPress={handleContactUs}
            />
            <SettingsItem
              icon="help-circle-outline"
              label="Help & FAQs"
              onPress={handleHelpFAQs}
            />
          </SettingsSection>

          {/* User Policy */}
          <SettingsSection title="User Policy">
            <SettingsItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={handlePrivacyPolicy}
            />
            <SettingsItem
              icon="document-text-outline"
              label="Regulation"
              onPress={handleRegulation}
            />
            <SettingsItem
              icon="document-outline"
              label="Terms of Service"
              onPress={handleTermsOfService}
            />
            <SettingsItem
              icon="hand-left-outline"
              label="Dispute Resolution Policy"
              onPress={handleDisputeResolution}
            />
          </SettingsSection>

          {/* Support */}
          <SettingsSection title="Support">
            <SettingsItem
              icon="trash-outline"
              label="Request Account Deletion"
              onPress={handleRequestAccountDeletion}
            />
            <SettingsItem
              icon="information-circle-outline"
              label="About Us"
              onPress={handleAboutUs}
            />
          </SettingsSection>
        </ScrollView>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fdfdfd",
  },
  
  header: {
    //borderBottomLeftRadius: 40,
    //borderBottomRightRadius: 40,
    paddingTop: 60,
    paddingBottom: 30,
  },
  
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  
  headerCenter: {
    flex: 1,
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  
  scrollView: {
    flex: 1,
  },
  
  section: {
    marginTop: 20,
  },
  
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ff9800",
    marginBottom: 8,
    paddingHorizontal: 20,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  
  sectionContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  
  settingsIcon: {
    marginRight: 12,
    color: "#ff9800",
  },
  
  settingsText: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  settingsValue: {
    fontSize: 14,
    color: "#6c757d",
    marginRight: 8,
  },
  
  logoutContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  
  logoutButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ff9800",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff9800",
  },
});

export default SettingsScreen; 