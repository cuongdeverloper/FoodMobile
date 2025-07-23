import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from 'react';

const Favourite = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"food" | "restaurant">("food");
  const [cartCount, setCartCount] = useState(0);
  const [ratings, setRatings] = useState<{ [key: string]: { avg: number; count: number } }>({});
  const router = useRouter();

  const API_BASE_URL =
    process.env.EXPO_PUBLIC_ANDROID_API_URL || process.env.EXPO_PUBLIC_IOS_API_URL;
    

    useFocusEffect(
      useCallback(() => {
        fetchFavorites();
        fetchCartCount();
      }, [])
    );
  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavorites(res.data.data);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartCount(res.data.data.length);
    } catch (err) {
      console.error("Error fetching cart count:", err.message);
    }
  };

  const fetchAverageRating = async (itemId: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/api/reviews/average/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRatings((prev) => ({
        ...prev,
        [itemId]: { avg: res.data.avg, count: res.data.count },
      }));
    } catch (err) {
      console.error("Error fetching average rating:", err.message);
    }
  };

  useEffect(() => {
    fetchFavorites();
    fetchCartCount();
  }, []);

  useEffect(() => {
    favorites.forEach((fav, index) => {
      let id: string | undefined;
      if (typeof fav.itemId === 'string') {
        id = fav.itemId;
      } else if (fav.itemId && typeof fav.itemId._id === 'string') {
        id = fav.itemId._id;
      }
  
      if (id && /^[0-9a-fA-F]{24}$/.test(id)) {
        fetchAverageRating(id);
      } 
    });
  }, [favorites]);

  const handleAddToCart = async (food: any) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.post(
        `${API_BASE_URL}/api/cart`,
        {
          itemId: food._id,
          title: food.title,
          quantity: 1,
          basePrice: food.basePrice,
          options: [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCartCount();
      Alert.alert("✅ Success", "Added to cart!");
    } catch {
      Alert.alert("❌ Error", "Failed to add to cart.");
    }
  };
  const handleRemoveFavorite = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.delete(`${API_BASE_URL}/api/favorites/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFavorites(); // Reload danh sách sau khi xóa
    } catch (err) {
      Alert.alert("❌ Error", "Xóa khỏi yêu thích thất bại.");
    }
  };
  const renderFoodItem = ({ item }: { item: any }) => {
    const food = item.itemId;
    if (!food) return null;

    const ratingInfo = ratings[food._id] || { avg: 0, count: 0 };

    return (
      <TouchableOpacity
      onPress={() =>
        router.navigate({
          pathname: '/product/MenuItemDetail',
          params: { id: food._id },
        })
      }
    >
      <View style={styles.card}>
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: `${API_BASE_URL}/uploads/${food.image}` }}
            style={styles.foodImage}
          />
<Pressable
  style={styles.heartBtn}
  onPress={() => handleRemoveFavorite(food._id)}
>
  <Ionicons name="heart" size={22} color="orange" />
</Pressable>
          <View style={styles.priceTag}>
            <Text style={{ color: "#222", fontWeight: "bold", fontSize: 15 }}>
              {food.basePrice?.toFixed(2) ?? "??"} VND
            </Text>
          </View>
        </View>
        <View style={{ padding: 10, paddingBottom: 16 }}>
          <Text style={styles.foodName}>{food.title}</Text>
          <Text style={styles.foodDesc} numberOfLines={1}>
            {food.description || ""}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Text style={{ color: "#222", fontWeight: "bold", fontSize: 15 }}>
              {ratingInfo.avg.toFixed(1)}
            </Text>
            <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 2 }} />
            <Text style={{ color: "#888", marginLeft: 4 }}>({ratingInfo.count})</Text>
          </View>
          <Pressable onPress={() => handleAddToCart(food)} style={styles.cartBtn}>
            <Ionicons name="cart" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Add to Cart</Text>
          </Pressable>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  const renderRestaurantItem = ({ item }: { item: any }) => {
    const restaurant = item.restaurantId;
    if (!restaurant) return null;
    return (
      <TouchableOpacity
      onPress={() =>
        router.navigate({
          pathname: '/product/[id]',
          params: { id: item.restaurantId._id },
        })
      }
    >
      <View style={styles.card}>
      <View style={{ position: "relative" }}>
  <Image
    source={{ uri: `${API_BASE_URL}/uploads/${restaurant.image}` }}
    style={styles.foodImage}
  />
  <Pressable
    style={styles.heartBtn}
    onPress={() => handleRemoveFavorite(restaurant._id)}
  >
    <Ionicons name="heart" size={22} color="orange" />
  </Pressable>
</View>
<View style={{ padding: 10, paddingBottom: 16 }}>
          <Text style={styles.foodName}>{restaurant.name}</Text>
          <Text style={styles.foodDesc}>{restaurant.address || "No address provided"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Text style={{ color: "#222", fontWeight: "bold", fontSize: 15 }}>
              {restaurant.rating?.toFixed(1) || "0.0"}
            </Text>
            <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 2 }} />
          </View>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  const filteredFavorites = favorites.filter((fav) => {
    return tab === "food" ? fav.itemId : fav.restaurantId;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.push("/")} style={{ marginRight: 12 }}>
          <Ionicons name="arrow-back" size={26} color="#222" />
        </Pressable>
        <Text style={styles.header}>Favorites</Text>
        <Pressable onPress={() => router.push("/CartPage")} style={styles.cartIcon}>
          <Ionicons name="cart" size={26} color="#222" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tabBtn, tab === "food" && styles.tabActive]}
          onPress={() => setTab("food")}
        >
          <Text style={{ color: tab === "food" ? "#fff" : "orange", fontWeight: "bold" }}>
            Food Items
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabBtn, tab === "restaurant" && styles.tabActive]}
          onPress={() => setTab("restaurant")}
        >
          <Text
            style={{ color: tab === "restaurant" ? "#fff" : "orange", fontWeight: "bold" }}
          >
            Restaurants
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="orange" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item._id}
          renderItem={tab === "food" ? renderFoodItem : renderRestaurantItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
              No favorite {tab === "food" ? "food items" : "restaurants"}
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center", padding: 16 },
  header: { fontSize: 22, fontWeight: "700", color: "#222" },
  cartIcon: {
    marginLeft: "auto",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -8,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  tabRow: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  tabBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "orange",
  },
  tabActive: { backgroundColor: "orange" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  foodImage: { width: "100%", height: 160 },
  heartBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    zIndex: 10,
  },
  priceTag: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    zIndex: 10,
  },
  foodName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 2,
  },
  foodDesc: { color: "#888", fontSize: 14 },
  cartBtn: {
    marginTop: 10,
    backgroundColor: "orange",
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
});

export default Favourite;
