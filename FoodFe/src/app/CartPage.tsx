import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// --- Interfaces for better type safety ---
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
  itemId: PopulatedMenuItem; // `itemId` is populated with `PopulatedMenuItem`
  title: string; // Fallback title, though `itemId.title` is preferred
  basePrice: number;
}

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Determine API base URL based on platform for development
  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  // --- Data Fetching & Manipulation ---
  const fetchCart = async () => {
    setLoading(true); // Set loading true before fetching
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        // Handle case where token is not available (e.g., user not logged in)
        Alert.alert("Lỗi", "Bạn cần đăng nhập để xem giỏ hàng.");
        router.push("/auth/login"); // Redirect to login page
        return;
      }
      const res = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart(res.data.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      Alert.alert("Lỗi", "Không thể tải giỏ hàng. Vui lòng thử lại sau.");
      setCart([]); // Clear cart on error to prevent displaying stale data
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      Alert.alert(
        "Xóa sản phẩm",
        "Bạn có muốn xóa sản phẩm này khỏi giỏ hàng?",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Xóa", onPress: () => handleRemove(id) },
        ]
      );
      return;
    }
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.put(
        `${API_BASE_URL}/api/cart/${id}`,
        { quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Optimistically update quantity in UI for better UX
      setCart((prevCart) =>
        prevCart.map((item) =>
          item._id === id ? { ...item, quantity } : item
        )
      );
      // Consider re-fetching only if optimistic update is complex or prone to errors
      // fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      Alert.alert("Lỗi", "Không thể cập nhật số lượng.");
    }
  };

  const handleRemove = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Remove item from cart state immediately
      setCart((prevCart) => prevCart.filter((item) => item._id !== id));
      Alert.alert("Thành công", "Sản phẩm đã được xóa khỏi giỏ hàng.");
    } catch (err) {
      console.error("Error removing item:", err);
      Alert.alert("Lỗi", "Không thể xóa mục khỏi giỏ hàng.");
    }
  };

  const calculateTotal = (): number => {
    return cart.reduce((sum, item) => {
      const extraOptionsPrice =
        item.options?.reduce((s, o) => s + o.additionalPrice, 0) || 0;
      return sum + (item.basePrice + extraOptionsPrice) * item.quantity;
    }, 0);
  };

  // --- Effects ---
  useEffect(() => {
    fetchCart();
  }, []); // Empty dependency array means this runs once on mount

  // --- Render Functions ---
  const renderItem = ({ item }: { item: CartItem }) => {
    const extraOptionsPrice =
      item.options?.reduce((s, o) => s + o.additionalPrice, 0) || 0;
    const itemTotalPrice = (item.basePrice + extraOptionsPrice) * item.quantity;

    const imageUrl = item.itemId?.image; // Use optional chaining for safety

    return (
      <View style={styles.card}>
        {imageUrl ? (
          <Image
            source={{ uri: `${API_BASE_URL}/uploads/${imageUrl}` }}
            style={styles.image}
            resizeMode="cover" // Good for images
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons name="image-outline" size={32} color="#aaa" />
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}

        <View style={styles.itemDetails}>
          <Text style={styles.title}>
            {item.itemId?.title || item.title || "Unknown Item"}
          </Text>

          {item.options?.length > 0 && (
            <View style={styles.optionBox}>
              <Text style={styles.optionBoxTitle}>Tùy chọn đã chọn:</Text>
              {item.options.map((opt, idx) => (
                <View key={idx} style={styles.optionItem}>
                  <Text style={styles.optionTitle}>• {opt.title}</Text>
                  {opt.description ? (
                    <Text style={styles.optionDesc}>
                      {opt.description.length > 0
                        ? opt.description
                        : "Không có mô tả"}
                    </Text>
                  ) : null}
                  <Text style={styles.optionPrice}>
                    +{opt.additionalPrice.toLocaleString()}đ
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.quantityControl}>
            <Pressable
              onPress={() => updateQuantity(item._id, item.quantity - 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="remove-circle-outline" size={26} color="#555" />
            </Pressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Pressable
              onPress={() => updateQuantity(item._id, item.quantity + 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="add-circle-outline" size={26} color="#555" />
            </Pressable>
          </View>
          <Text style={styles.price}>
            Giá: {itemTotalPrice.toLocaleString()}đ
          </Text>
        </View>

        <Pressable
          onPress={() => handleRemove(item._id)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={24} color="#e74c3c" />
        </Pressable>
      </View>
    );
  };

  // --- Main Render ---
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Đang tải giỏ hàng của bạn...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Giỏ hàng của bạn</Text>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyCartContainer}>
            <Ionicons name="cart-outline" size={100} color="#ccc" />
            <Text style={styles.emptyCartText}>Giỏ hàng của bạn đang trống!</Text>
            <Text style={styles.emptyCartSubText}>
              Hãy bắt đầu khám phá các món ăn ngon nhé.
            </Text>
            <Pressable style={styles.browseButton} onPress={() => router.push("/")}>
              <Text style={styles.browseButtonText}>Bắt đầu mua sắm</Text>
            </Pressable>
          </View>
        }
      />

      {cart.length > 0 && (
        <View style={styles.totalBar}>
          <Text style={styles.totalText}>
            Tổng cộng:{" "}
            <Text style={styles.totalAmount}>
              {calculateTotal().toLocaleString()}đ
            </Text>
          </Text>
          <Pressable
            style={styles.checkoutBtn}
            onPress={() => router.push("/ConfirmOrderPage")}
          >
            <Ionicons name="cash-outline" size={20} color="#fff" />
            <Text style={styles.checkoutBtnText}>Thanh toán</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light grey background
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
  },
  headerContainer: {
    position: "absolute", // Keep header fixed
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : 20, // Adjust for iOS SafeArea
    paddingBottom: 15,
    paddingHorizontal: 20, // Increased horizontal padding
    borderBottomWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8, // Increased touch target
    marginRight: 10, // Space between button and title
  },
  pageTitle: {
    fontSize: 22, // Larger title
    fontWeight: "bold", // Bolder
    color: "#333",
  },
  listContentContainer: {
    paddingTop: Platform.OS === "ios" ? 120 : 90, // Adjust padding to account for fixed header height
    paddingHorizontal: 16,
    paddingBottom: 20, // Padding at the bottom for the last item
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 15,
    padding: 15, // Increased padding
    borderRadius: 15, // More rounded corners
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: "flex-start",
    gap: 15, // Consistent spacing
  },
  image: {
    width: 90, // Slightly larger image
    height: 90,
    borderRadius: 12, // Match card border radius
  },
  imagePlaceholder: {
    backgroundColor: "#f0f0f0", // Lighter placeholder background
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  itemDetails: {
    flex: 1,
  },
  title: {
    fontSize: 19, // Larger title
    fontWeight: "700",
    color: "#333",
    marginBottom: 5,
  },
  optionBox: {
    marginTop: 10,
    backgroundColor: "#fefefe", // Very light background
    borderRadius: 10,
    padding: 10,
    borderColor: "#eee", // Lighter border
    borderWidth: 1,
    borderLeftWidth: 4, // Accent border
    borderLeftColor: "#007bff", // Primary color accent
  },
  optionBoxTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  optionItem: {
    marginBottom: 8, // More space between options
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
  },
  optionDesc: {
    fontSize: 13,
    color: "#777", // Darker description for better readability
    fontStyle: "italic",
    marginTop: 2,
  },
  optionPrice: {
    fontSize: 15,
    color: "#e67e22", // A distinct orange for price
    fontWeight: "600",
    marginTop: 2,
  },
  price: {
    fontSize: 17, // Larger price
    color: "#28a745", // Green for price
    fontWeight: "bold",
    marginTop: 10, // More space
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    gap: 12, // Increased gap
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10, // More rounded
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start", // Fit content
    backgroundColor: "#f9f9f9", // Slight background
  },
  quantityButton: {
    padding: 5, // Make pressable area larger
  },
  quantityText: {
    fontSize: 18, // Larger quantity text
    fontWeight: "bold",
    minWidth: 30, // Ensure consistent width
    textAlign: "center",
    color: "#333",
  },
  removeButton: {
    padding: 10, // Larger touch target
  },
  totalBar: {
    padding: 20, // Increased padding
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1, // Stronger shadow for bottom bar
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 5,
    elevation: 5,
  },
  totalText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e67e22", // Use the accent orange for total
  },
  checkoutBtn: {
    flexDirection: "row",
    backgroundColor: "#007bff", // Primary blue button
    paddingVertical: 12,
    paddingHorizontal: 25, // More horizontal padding
    borderRadius: 10, // More rounded button
    alignItems: "center",
    gap: 10, // Increased gap
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  checkoutBtnText: {
    color: "#fff",
    fontWeight: "bold", // Bolder text
    fontSize: 16,
  },
  // Empty cart styles (already well-designed)
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 20,
  },
  emptyCartText: {
    fontSize: 24, // Larger text
    fontWeight: "bold",
    color: "#555",
    marginTop: 25,
    textAlign: "center",
  },
  emptyCartSubText: {
    fontSize: 17, // Larger subtext
    color: "#888",
    marginTop: 15,
    marginBottom: 40,
    textAlign: "center",
  },
  browseButton: {
    backgroundColor: "#007bff",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#007bff",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 19,
    fontWeight: "600",
  },
});

export default CartPage;