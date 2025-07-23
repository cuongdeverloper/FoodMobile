import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

const notifications = [
  {
    id: 1,
    title: "Đơn hàng #1234 đã được xác nhận",
    description: "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đang được chuẩn bị.",
    time: "2 phút trước",
    icon: "checkmark-done-circle",
  },
  {
    id: 2,
    title: "Giảm giá 30% cho đơn hàng hôm nay!",
    description: "Nhanh tay đặt hàng để nhận ưu đãi chỉ trong hôm nay.",
    time: "1 giờ trước",
    icon: "pricetags",
  },
  {
    id: 3,
    title: "Món ăn yêu thích của bạn đã quay lại!",
    description: "Phở bò đặc biệt đã có mặt trong thực đơn hôm nay.",
    time: "Hôm qua",
    icon: "restaurant",
  },
  {
    id: 4,
    title: "Giao hàng thành công",
    description: "Đơn hàng của bạn đã được giao đến địa chỉ 123 Nguyễn Trãi.",
    time: "2 ngày trước",
    icon: "checkmark-circle",
  },
];

const Notification = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <Ionicons name="notifications" size={24} color="#fff" />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {notifications.map((item) => (
          <View key={item.id} style={styles.notificationCard}>
            <Ionicons name={item.icon as any} size={28} color="orange" style={styles.notificationIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationDescription}>{item.description}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>


    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: "#F5F7FA",
    },
    header: {
      flexDirection: "row",
      backgroundColor: "orange",
      padding: 20,
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    headerTitle: {
      color: "#fff",
      fontSize: 22,
      fontWeight: "bold",
    },
    scrollContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    notificationCard: {
      flexDirection: "row",
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    notificationIcon: {
      marginRight: 12,
    },
    notificationTitle: {
      fontWeight: "600",
      fontSize: 16,
      color: "#212121",
    },
    notificationDescription: {
      fontSize: 14,
      color: "#616161",
      marginTop: 4,
    },
    notificationTime: {
      fontSize: 12,
      color: "#9E9E9E",
      marginTop: 4,
    },
    bottomBar: {
      flexDirection: "row",
      justifyContent: "space-around",
      backgroundColor: "#fff",
      paddingVertical: 10,
      borderTopColor: "#E0E0E0",
      borderTopWidth: 1,
      position: "absolute",
      bottom: 0,
      width: "100%",
    },
    navItem: {
      alignItems: "center",
      justifyContent: "center",
    },
    navText: {
      fontSize: 12,
      color: "#757575",
      marginTop: 2,
    },
  });
  
export default Notification;
