import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import demo from '@/assets/demo.jpg';
import { getTopRestaurant } from '@/utils/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface IProps {
  name: string;
  description: string;
  refAPI: string;
}

interface ITopRestaurant {
  _id: string;
  name: string;
  image: string;
}

const CollectionHome = (props: IProps) => {
  const { name, description, refAPI } = props;
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<ITopRestaurant[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const backend =
    Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getTopRestaurant(refAPI);
        if (res.data) {
          setRestaurant(res.data.data ?? []);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refAPI]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          const res = await axios.get(`${backend}/api/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          const restaurantFavorites = res.data.data
            .filter((f: any) => f.restaurantId) // Chỉ lấy favorite là nhà hàng
            .map((f: any) => f.restaurantId._id);

          setFavorites(restaurantFavorites);
        }
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    };
    fetchFavorites();
  }, [backend]);

  const handleFavorite = async (item: ITopRestaurant) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        console.log('User not authenticated.');
        return;
      }

      const isFavorited = favorites.includes(item._id);

      if (isFavorited) {
        await axios.delete(`${backend}/api/favorites/${item._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavorites(favorites.filter((id) => id !== item._id));
      } else {
        await axios.post(
          `${backend}/api/favorites`,
          { restaurantId: item._id },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFavorites([...favorites, item._id]);
      }
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  };

  const renderRestaurantItem = ({ item }: { item: ITopRestaurant }) => (
    <TouchableOpacity
      onPress={() =>
        router.navigate({
          pathname: '/product/[id]',
          params: { id: item._id },
        })
      }
      style={styles.card}
    >
      <Image
        style={styles.cardImage}
        source={{ uri: `${backend}/uploads/${item.image}` }}
        defaultSource={demo}
      />
      <Pressable style={styles.favoriteButton} onPress={() => handleFavorite(item)}>
        <Ionicons
          name={favorites.includes(item._id) ? 'heart' : 'heart-outline'}
          size={22}
          color="orange"
        />
      </Pressable>
      <View style={styles.cardContent}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.saleBadge}>
          <Text style={styles.saleText}>Flash Sales</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <View style={styles.separator} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{name}</Text>
          <TouchableOpacity onPress={() => router.navigate('/AllRestaurantsScreen')}>
            <Text style={styles.headerSeeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="orange" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={restaurant}
            horizontal
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            renderItem={renderRestaurantItem}
            ListEmptyComponent={<Text style={styles.emptyListText}>Không có nhà hàng nào.</Text>}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    width: '100%',
  },
  separator: {
    height: 10,
    backgroundColor: '#e9e9e9',
  },
  header: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    color: 'orange',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSeeAll: {
    color: '#5a5a5a',
    fontSize: 14,
  },
  descriptionContainer: {
    marginBottom: 15,
  },
  descriptionText: {
    color: '#5a5a5a',
    fontSize: 13,
    lineHeight: 18,
  },
  flatListContent: {
    gap: 12,
    paddingVertical: 5,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    width: 140,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardImage: {
    height: 125,
    width: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 6,
  },
  cardContent: {
    padding: 8,
  },
  cardName: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  saleBadge: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'orange',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#fff7ed',
  },
  saleText: {
    color: 'orange',
    fontSize: 11,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    paddingVertical: 20,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
    fontSize: 14,
  },
});

export default CollectionHome;
