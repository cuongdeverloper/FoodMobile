import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Platform ,Pressable} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getTopRestaurant } from '@/utils/api'; // Đảm bảo đường dẫn này đúng
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import demo from "@/assets/demo.jpg"; // Sử dụng ảnh demo nếu không có ảnh từ API

interface IRestaurant {
    _id: string;
    name: string;
    image: string;
    // Thêm các thuộc tính khác của nhà hàng nếu có
}

const AllRestaurantsScreen = () => {
    const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<string[]>([]);
    const router = useRouter();

    const backend =
        Platform.OS === "android"
            ? process.env.EXPO_PUBLIC_ANDROID_API_URL
            : process.env.EXPO_PUBLIC_IOS_API_URL;

    useEffect(() => {
        const fetchAllRestaurants = async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem("access_token");
                const res = await axios.get(`${backend}/api/restaurant/restaurant`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data) {
                    setRestaurants(res.data.data ?? []);
                }
            } catch (error) {
                console.error("Failed to fetch all restaurants:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchFavorites = async () => {
            try {
              const token = await AsyncStorage.getItem("access_token");
              if (token) {
                const res = await axios.get(`${backend}/api/favorites`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const validFavorites = res.data.data.filter((f: any) => f.restaurantId && f.restaurantId._id);
                setFavorites(validFavorites.map((f: any) => f.restaurantId._id));
              }
            } catch (error) {
              console.error("Failed to fetch favorites:", error);
            }
          };
        

        fetchAllRestaurants();
        fetchFavorites();
    }, [backend]);

    const handleFavorite = async (item: IRestaurant) => {
        try {
          const token = await AsyncStorage.getItem("access_token");
          if (!token) {
            console.log("User not authenticated.");
            return;
          }
      
          if (favorites.includes(item._id)) {
            // Gọi xoá theo ID
            await axios.delete(`${backend}/api/favorites/${item._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites(favorites.filter(id => id !== item._id));
          } else {
            
            await axios.post(`${backend}/api/favorites`, { restaurantId: item._id }, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setFavorites([...favorites, item._id]);
          }
        } catch (error) {
          console.error("Failed to update favorite status:", error);
        }
      };

    const renderRestaurantItem = ({ item }: { item: IRestaurant }) => (
        <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => router.navigate({
                pathname: "/product/[id]",
                params: { id: item._id }
            })}
        >
            <Image
                style={styles.restaurantImage}
                source={{ uri: `${backend}/uploads/${item.image}` }}
                defaultSource={demo}
            />
            <Pressable
                style={styles.favoriteButton}
                onPress={() => handleFavorite(item)}
            >
                <Ionicons
                    name={favorites.includes(item._id) ? "heart" : "heart-outline"}
                    size={24}
                    color="orange"
                />
            </Pressable>
            <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.saleBadge}>
                    <Text style={styles.saleText}>Flash Sales</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{
                headerTitle: "Tất cả nhà hàng",
                headerBackTitleVisible: false,
            }} />
            {loading ? (
                <ActivityIndicator size="large" color="orange" style={styles.loading} />
            ) : (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item._id}
                    renderItem={renderRestaurantItem}
                    contentContainerStyle={styles.listContent}
                    numColumns={2} // Hiển thị 2 cột
                    columnWrapperStyle={styles.columnWrapper}
                    ListEmptyComponent={<Text style={styles.emptyText}>Không có nhà hàng nào để hiển thị.</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 10,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingVertical: 15,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    restaurantCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        width: '48%', // Khoảng 48% để có khoảng cách giữa các cột
        marginBottom: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    restaurantImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 25,
        padding: 8,
    },
    restaurantInfo: {
        padding: 10,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    saleBadge: {
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'orange',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 5,
        alignSelf: "flex-start",
        backgroundColor: '#fff7ed',
    },
    saleText: {
        color: "orange",
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#777',
    },
});

export default AllRestaurantsScreen;