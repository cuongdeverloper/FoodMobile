import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

interface Option {
  title: string;
  description: string;
  additionalPrice: number;
}

interface MenuItem {
  _id: string;
  title: string;
  basePrice: number;
  image: string;
  options: Option[];
}

const MenuItemDetail = () => {
  const router = useRouter();
  const handlePressMenuItem = (itemId: any) => {
    router.push(``); // Điều chỉnh route nếu cần
  };
  
  const handlePressRestaurant = (restaurantId: any) => {
    router.push(`/restaurant/${restaurantId}`); // Tương ứng với [id].tsx
  };
  const { id } = useLocalSearchParams();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviewLoading, setReviewLoading] = useState(true);

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  useEffect(() => {
    const fetchMenuItem = async () => {
      setError(null);
      setLoading(true);

      const itemId = Array.isArray(id) ? id[0] : id;
      if (!itemId) {
        setError("Không có ID món ăn.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/restaurant/menu-items/${itemId}`
        );
        if (res.data.success) {
          setMenuItem(res.data.data);
        } else {
          setError(res.data.message || "Không lấy được dữ liệu.");
        }
      } catch (err) {
        setError("Lỗi khi tải dữ liệu món ăn.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItem();
  }, [id]);

  useEffect(() => {
    const fetchFavorite = async () => {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFavorite(res.data.data.some((f: any) => f.itemId._id === menuItem?._id));
    };
    if (menuItem?._id) fetchFavorite();
  }, [menuItem?._id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!menuItem?._id) return;
      setReviewLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        const [all, avg] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reviews/${menuItem._id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/api/reviews/average/${menuItem._id}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setReviews(all.data.data);
        setAvgRating(avg.data.avg || 0);
        setReviewCount(avg.data.count || 0);
      } catch {
        setReviews([]); 
        setAvgRating(0); 
        setReviewCount(0);
      } finally {
        setReviewLoading(false);
      }
    };
    fetchReviews();
  }, [menuItem?._id]);

  const handleAddToCart = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/api/cart`,
        {
          itemId: menuItem?._id,
          title: menuItem?.title,
          quantity,
          basePrice: menuItem?.basePrice,
          options: selectedOption ? [selectedOption] : [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      Alert.alert("✅ Thành công", "Đã thêm vào giỏ hàng!");
    } catch (err: any) {
      console.error("❌ Lỗi addToCart:", err?.response?.data || err.message);
      Alert.alert(
        "❌ Lỗi",
        err?.response?.data?.message || "Không thể thêm vào giỏ hàng"
      );
    }
  };

  const handleFavorite = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (isFavorite) {
      await axios.delete(`${API_BASE_URL}/api/favorites/${menuItem?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFavorite(false);
    } else {
      await axios.post(`${API_BASE_URL}/api/favorites`, { itemId: menuItem?._id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFavorite(true);
    }
  };

  const totalPrice = () => {
    const base = menuItem?.basePrice || 0;
    const extra = selectedOption?.additionalPrice || 0;
    return (base + extra) * quantity;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Đang tải món ăn...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.buttonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  const fullImageUrl = menuItem?.image
  ? `${API_BASE_URL}/uploads/${menuItem.image.replace(/^\/?uploads\//, '')}`
  : undefined;

  return (
    <ScrollView style={styles.container}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      {fullImageUrl && (
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: fullImageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <Pressable
            style={{ position: 'absolute', top: 16, right: 16, backgroundColor: '#fff', borderRadius: 20, padding: 6, zIndex: 10 }}
            onPress={handleFavorite}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={28} color="orange" />
          </Pressable>
        </View>
      )}

      <Text style={styles.title}>{menuItem?.title}</Text>
      <Text style={styles.price}>
        Giá gốc: {menuItem?.basePrice.toLocaleString()}đ
      </Text>

      {/* Rating trung bình */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        {[1,2,3,4,5].map(i => (
          <Ionicons key={i} name={i <= Math.round(avgRating) ? "star" : "star-outline"} size={22} color="#FFD700" />
        ))}
        <Text style={{ marginLeft: 8, color: '#222', fontWeight: 'bold' }}>{avgRating.toFixed(1)} ({reviewCount})</Text>
      </View>

      {/* OPTIONS */}
      {menuItem?.options?.length > 0 && (
        <View style={styles.optionSection}>
          <Text style={styles.optionHeader}>Tùy chọn:</Text>
          {menuItem.options.map((opt, idx) => {
            const isSelected =
              selectedOption &&
              JSON.stringify(selectedOption) === JSON.stringify(opt);

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedOption(opt)}
              >
                <View style={styles.optionTop}>
                  <Text style={styles.optionTitle}>{opt.title}</Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#28a745" />
                  )}
                </View>
                {opt.description && (
                  <Text style={styles.optionDescription}>{opt.description}</Text>
                )}
                <Text style={styles.optionPrice}>
                  +{opt.additionalPrice.toLocaleString()}đ
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Quantity */}
      <View style={styles.qtyContainer}>
        <Text style={styles.qtyLabel}>Số lượng:</Text>
        <View style={styles.qtyControl}>
          <Pressable
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Ionicons name="remove-circle-outline" size={28} color="#555" />
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable onPress={() => setQuantity((q) => q + 1)}>
            <Ionicons name="add-circle-outline" size={28} color="#555" />
          </Pressable>
        </View>
      </View>

      <Text style={styles.total}>Tổng tiền: {totalPrice().toLocaleString()}đ</Text>

      <Pressable
        style={[styles.button, { marginTop: 20 }]}
        onPress={handleAddToCart}
      >
        <Ionicons name="cart-outline" size={20} color="white" />
        <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
      </Pressable>

      <Pressable
        style={[styles.button, { marginTop: 12, backgroundColor: "#28a745" }]}
        onPress={() => router.push("/CartPage")}
      >
        <Ionicons name="cart" size={20} color="white" />
        <Text style={styles.buttonText}>Xem giỏ hàng</Text>
      </Pressable>

      {/* Danh sách review */}
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6, marginTop: 20 }}>Bình luận gần đây:</Text>
      {reviewLoading ? <ActivityIndicator color="#ff9800" /> : (
        reviews.length === 0 ? <Text style={{ color: '#888' }}>Chưa có bình luận nào.</Text> :
        reviews.map((r, idx) => (
          <View key={r._id || idx} style={{ marginBottom: 12, backgroundColor: '#f6f6f6', borderRadius: 8, padding: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ fontWeight: 'bold', marginRight: 8 }}>{r.userId?.username || 'User'}</Text>
              {[1,2,3,4,5].map(i => (
                <Ionicons key={i} name={i <= r.rating ? "star" : "star-outline"} size={16} color="#FFD700" />
              ))}
            </View>
            <Text style={{ color: '#555' }}>{r.comment}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 10,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 8,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    marginTop: 10,
  },
  title: { fontSize: 26, fontWeight: "800", color: "#333", marginBottom: 4 },
  price: { fontSize: 18, color: "#888", marginBottom: 16 },
  optionSection: { marginTop: 20 },
  optionHeader: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  optionCard: {
    backgroundColor: "#f9f9f9",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  optionCardSelected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#28a745",
  },
  optionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  optionDescription: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
    fontStyle: "italic",
  },
  optionPrice: {
    fontSize: 15,
    color: "#e67e22",
    fontWeight: "600",
    marginTop: 6,
    textAlign: "right",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    gap: 10,
  },
  qtyLabel: { fontSize: 18, fontWeight: "600", color: "#333" },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 12,
  },
  qtyText: { fontSize: 18, fontWeight: "600" },
  total: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
    marginTop: 18,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "600" },
  errorText: { color: "red", marginBottom: 20, textAlign: "center" },
});

export default MenuItemDetail;
