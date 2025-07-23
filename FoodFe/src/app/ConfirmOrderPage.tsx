import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { reverseGeocode } from "../utils/nominatim";

interface Option {
  title: string;
  description: string;
  additionalPrice: number;
}

interface PopulatedMenuItem {
  _id: string;
  image?: string;
  title: string;
}

interface CartItem {
  _id: string;
  quantity: number;
  options: Option[];
  itemId: PopulatedMenuItem;
  title: string;
  basePrice: number;
}

const ConfirmOrderPage = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  const [mapVisible, setMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.data);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  const calculateRawTotal = () => {
    return cart.reduce((sum, item) => {
      const extra = item.options?.reduce((s, o) => s + o.additionalPrice, 0) || 0;
      return sum + (item.basePrice + extra) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return Math.max(calculateRawTotal() - discount, 0);
  };

  const applyPromo = async () => { // Make this function async
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      Alert.alert("Thông báo", "Vui lòng nhập mã khuyến mãi.");
      return;
    }
    try {
      // Call your backend API to validate the promo code
      const response = await axios.get(`${API_BASE_URL}/api/promos/${code}`);
      const { discount: promoValue } = response.data; // Get discount from the response

      setDiscount(promoValue);
      Alert.alert("✅", `Đã áp dụng mã ${code}, giảm ${promoValue.toLocaleString()}đ`);
    } catch (error: any) {
      console.error("Lỗi khi áp dụng mã khuyến mãi:", error.response?.data?.message || error.message);
      setDiscount(0); // Reset discount if there's an error
      Alert.alert("❌", error.response?.data?.message || "Mã khuyến mãi không hợp lệ hoặc đã hết hạn!");
    }
  };

  const handleConfirm = async () => {
    if (!name || !phone || !address) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ họ tên, SĐT và địa chỉ");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/api/orders`,
        {
          name,
          phone,
          address,
          promoCode,
          discount,
          items: cart,
          total: calculateTotal(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("🎉", "Đặt hàng thành công!");
      router.push("/order");
    } catch (err) {
      console.error("Lỗi khi xác nhận đơn hàng:", err);
      Alert.alert("Lỗi", "Không thể xác nhận đơn hàng");
    }
  };

  const openMap = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Lỗi", "Không có quyền truy cập vị trí.");
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      };

      setCurrentLocation(coords);
      setSelectedLocation(coords);
      setMapVisible(true);
    } catch (error: any) {
      console.error("❌ Lỗi khi lấy vị trí:", error.message || error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại.");
      setMapVisible(false);
    }
  };

  useEffect(() => {
    fetchCart();
    loadDefaultAddress();
  }, []);

  const loadDefaultAddress = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem("user_addresses");
      console.log("🔍 ConfirmOrder - Saved addresses:", savedAddresses);
      
      if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses);
        console.log("📋 ConfirmOrder - Parsed addresses:", addresses);
        
        const defaultAddr = addresses.find((addr: any) => addr.isDefault);
        console.log("⭐ ConfirmOrder - Default address:", defaultAddr);
        
        if (defaultAddr) {
          setAddress(defaultAddr.address);
          console.log("✅ ConfirmOrder - Set address:", defaultAddr.address);
        } else {
          console.log("❌ ConfirmOrder - No default address found");
        }
      } else {
        console.log("❌ ConfirmOrder - No saved addresses found");
      }
    } catch (error) {
      console.error("Error loading default address:", error);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>🧾 Xác nhận đơn hàng</Text>

        {cart.map((item) => {
          const extra = item.options?.reduce((s, o) => s + o.additionalPrice, 0) || 0;
          const itemTotal = (item.basePrice + extra) * item.quantity;
          const imageUrl = item.itemId?.image;

          return (
            <View key={item._id} style={styles.cartItem}>
              {imageUrl ? (
                <Image source={{ uri: `${API_BASE_URL}/uploads/${imageUrl}` }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]}>
                  <Ionicons name="image-outline" size={24} color="#aaa" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.itemId?.title || item.title}</Text>
                {item.options?.map((opt, idx) => (
                  <Text key={idx} style={styles.optionText}>
                    ➕ {opt.title} (+{opt.additionalPrice.toLocaleString()}đ)
                  </Text>
                ))}
                <Text style={styles.itemPrice}>
                  x{item.quantity} - {itemTotal.toLocaleString()}đ
                </Text>
              </View>
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <TextInput
          placeholder="Họ tên"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Số điện thoại"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TextInput
          placeholder="Địa chỉ nhận hàng"
          style={styles.input}
          multiline
          value={address}
          onChangeText={setAddress}
        />
        
        {/* 👇 Nút chọn từ bản đồ (đẹp hơn) */}
        <Pressable onPress={openMap} style={styles.mapPickerBtn}>
          <Ionicons name="map-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.mapPickerText}>Chọn địa chỉ từ bản đồ</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Mã khuyến mãi</Text>
        <View style={styles.promoRow}>
          <TextInput
            placeholder="Nhập mã..."
            style={[styles.input, { flex: 1, marginRight: 10 }]}
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <Pressable style={styles.applyBtn} onPress={applyPromo}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Áp dụng</Text>
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Tiền hàng: {calculateRawTotal().toLocaleString()}đ
          </Text>
          <Text style={[styles.summaryText, { color: "#c0392b" }]}>
            Giảm giá: -{discount.toLocaleString()}đ
          </Text>
          <Text style={styles.totalText}>
            Tổng cộng: {calculateTotal().toLocaleString()}đ
          </Text>
        </View>

        <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
          <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 8 }}>
            Xác nhận đặt hàng
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={mapVisible} animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: selectedLocation?.lat || 10.762622,
              longitude: selectedLocation?.lng || 106.660172,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={(e) =>
              setSelectedLocation({
                lat: e.nativeEvent.coordinate.latitude,
                lng: e.nativeEvent.coordinate.longitude,
              })
            }
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.lat,
                  longitude: selectedLocation.lng,
                }}
              />
            )}
          </MapView>

          <View style={{ position: "absolute", bottom: 20, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable
              onPress={async () => {
                if (!selectedLocation) {
                  Alert.alert("Thông báo", "Vui lòng chọn một vị trí trên bản đồ.");
                  return;
                }
                try {
                  const formatted = await reverseGeocode(selectedLocation.lat, selectedLocation.lng);
                  setAddress(formatted);
                  setMapVisible(false);
                } catch (err: any) {
                  console.error("Lỗi reverseGeocode:", err);
                  Alert.alert("Lỗi", err.message || "Không thể lấy địa chỉ.");
                }
              }}
              style={{
                backgroundColor: "#27ae60",
                padding: 12,
                borderRadius: 8,
                flex: 1,
                marginRight: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Dùng địa chỉ này</Text>
            </Pressable>

            <Pressable
              onPress={() => setMapVisible(false)}
              style={{
                backgroundColor: "#e74c3c",
                padding: 12,
                borderRadius: 8,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>Hủy</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#f9f9f9" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 12,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  optionText: { fontSize: 13, color: "#666" },
  itemPrice: { fontSize: 14, color: "#28a745", marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
  },
  mapPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2980b9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapPickerText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  promoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  applyBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  summaryCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 15,
    marginBottom: 4,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#d35400",
    marginTop: 8,
  },
  confirmBtn: {
    backgroundColor: "#27ae60",
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ConfirmOrderPage;