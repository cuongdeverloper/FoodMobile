import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

interface IMenuItem {
  _id: string;
  title: string;
  basePrice: number;
  image: string;
  menu: string;
}

interface IMenu {
  _id: string;
  title: string;
  restaurant: string;
  menuItems: IMenuItem[];
}

interface ITopRestaurant {
  _id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  rating: number;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [restaurant, setRestaurant] = useState<ITopRestaurant | null>(null);
  const [menus, setMenus] = useState<IMenu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);

  const backend =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${backend}/api/restaurant/${id}`);
        const data = res.data.data;
        setRestaurant(data.restaurant);
        setMenus(data.menus);
        if (data.menus.length > 0) {
          setSelectedMenuId(data.menus[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [id]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const getSelectedMenuItems = () => {
    return menus.find((m) => m._id === selectedMenuId)?.menuItems || [];
  };

  if (!restaurant)
    return <Text style={{ textAlign: "center", marginTop: 100 }}>Đang tải thông tin...</Text>;

  return (
    <ScrollView style={styles.container} ref={scrollRef} showsVerticalScrollIndicator={false}>
      {/* Back button */}
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </Pressable>

      <Image
        source={{ uri: `${backend}/uploads/${restaurant.image}` }}
        style={styles.cover}
      />
      <Text style={styles.name}>{restaurant.name}</Text>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{restaurant.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{restaurant.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={20} color="#f5c518" />
          <Text style={styles.infoText}>{restaurant.rating.toFixed(1)} / 5</Text>
        </View>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuList}>
        <Text style={styles.menuHeader}>Danh mục món ăn</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
          {menus.map((menu) => (
            <TouchableOpacity
              key={menu._id}
              style={[
                styles.menuBtn,
                selectedMenuId === menu._id && styles.menuBtnSelected,
              ]}
              onPress={() =>
                setSelectedMenuId(menu._id === selectedMenuId ? null : menu._id)
              }
            >
              <Text
                style={{
                  color: selectedMenuId === menu._id ? "#fff" : "#333",
                  fontWeight: "600",
                }}
              >
                {menu.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Menu Items */}
      {selectedMenuId && (
        <View style={styles.menuItemsSection}>
          <Text style={styles.menuTitle}>Danh sách món</Text>
          {getSelectedMenuItems().map((item) => (
            <Pressable
              key={item._id}
              style={styles.menuItemCard}
              onPress={() =>
                router.push({
                  pathname: "/product/MenuItemDetail",
                  params: { id: item._id },
                })
              }
            >
              <Image
                source={{ uri: `${backend}/uploads/${item.image}` }}
                style={styles.menuImage}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuItemName}>{item.title}</Text>
                <Text style={styles.menuItemPrice}>
                  {item.basePrice.toLocaleString()}đ
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#aaa" />
            </Pressable>
          ))}
        </View>
      )}

      {/* Scroll to Top */}
      <Pressable style={styles.topBtn} onPress={scrollToTop}>
        <Ionicons name="arrow-up-circle" size={32} color="#007bff" />
        <Text style={{ color: "#007bff", fontWeight: "500", marginTop: 4 }}>
          Lên đầu trang
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fefefe" },

  backBtn: {
    position: "absolute",
    top: 40,
    left: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },

  cover: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    marginTop: 60,
    marginBottom: 16,
  },
  name: { fontSize: 26, fontWeight: "700", color: "#222", marginBottom: 4 },

  infoSection: {
    marginTop: 12,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#444",
    flex: 1,
  },

  menuList: { marginTop: 24 },
  menuHeader: { fontSize: 17, fontWeight: "600", color: "#333" },

  menuBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: "#eaeaea",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  menuBtnSelected: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },

  menuItemsSection: { marginTop: 24 },
  menuTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#111" },

  menuItemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuImage: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 14,
  },
  menuItemName: { fontSize: 16, fontWeight: "600", color: "#222" },
  menuItemPrice: { fontSize: 14, color: "#28a745", marginTop: 6 },

  topBtn: {
    alignItems: "center",
    marginVertical: 30,
  },
});

export default RestaurantDetail;
