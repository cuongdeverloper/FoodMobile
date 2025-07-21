import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Pressable,
  Platform, // Import Platform for platform-specific styles
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const OrderDetail = () => {
  const { id } = useLocalSearchParams(); // get order ID from URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const API_BASE_URL =
    process.env.EXPO_PUBLIC_ANDROID_API_URL || process.env.EXPO_PUBLIC_IOS_API_URL;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await axios.get(`${API_BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const found = res.data.data.find((o) => o._id === id);
        setOrder(found);
      } catch (err) {
        console.error('Failed to fetch order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff9800" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={50} color="#888" />
        <Text style={styles.notFoundText}>
          Order not found. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </Pressable>
        <Text style={styles.headerText}>Order #{order._id.slice(-6)}</Text>
      </View>

      {/* Order Status Badge */}
      <View style={styles.statusBadge}>
        <Text style={styles.statusBadgeText}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Text>
      </View>
     
      {/* Items */}
      <Text style={styles.sectionTitle}>Ordered Items</Text>
      {order.items.map((item, index) => (
        <View key={index} style={styles.itemCard}>
          {item.itemId?.image ? (
            <Image
              source={{ uri: `${API_BASE_URL}/uploads/${item.itemId.image}` }}
              style={styles.itemImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="fast-food-outline" size={40} color="#ccc" />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDetail}>Quantity: {item.quantity}</Text>
            <Text style={styles.itemDetail}>Base Price: ${item.basePrice.toFixed(2)}</Text>
            {item.options?.length > 0 && (
              <Text style={styles.itemOptions}>
                + {item.options.map((opt) => `${opt.title} (+$${opt.additionalPrice.toFixed(2)})`).join(', ')}
              </Text>
            )}
            <Text style={styles.itemTotalPrice}>Subtotal: ${((item.basePrice + (item.options?.reduce((sum, opt) => sum + opt.additionalPrice, 0) || 0)) * item.quantity).toFixed(2)}</Text>
          </View>
        </View>
      ))}
     
      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Shipping Info</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#555" />
          <Text style={styles.infoText}>Address: {order.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={18} color="#555" />
          <Text style={styles.infoText}>Phone: {order.phone}</Text>
        </View>
      </View>
    
      {/* Price */}
      <View style={styles.priceBox}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>${order.items.reduce((sum, item) => sum + ((item.basePrice + (item.options?.reduce((optSum, opt) => optSum + opt.additionalPrice, 0) || 0)) * item.quantity), 0).toFixed(2)}</Text>
        </View>
        {order.promoCode && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Promo Code: {order.promoCode}</Text>
            <Text style={styles.discountValue}>-${order.discount.toFixed(2)}</Text>
          </View>
        )}
        {order.discount > 0 && !order.promoCode && ( // Show discount even if no promo code is provided
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={styles.discountValue}>-${order.discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.priceSeparator} />
        <View style={styles.priceRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>${(order.total - (order.discount || 0)).toFixed(2)}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8', // Lighter background for the entire screen
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40, // Add some padding at the bottom
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  notFoundText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#888',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingTop: Platform.OS === 'android' ? 0 : 20, // Adjust for iOS safe area
  },
  backButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 22, // Slightly larger font
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allow text to take up remaining space
  },
  statusBadge: {
    backgroundColor: '#e0f2f7', // Light blue background for status
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start', // Fit to content
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196f3', // Blue text for status
  },
  sectionTitle: {
    fontSize: 19, // Slightly larger
    fontWeight: '700', // Bolder
    marginBottom: 15,
    color: '#333', // Darker color
    borderLeftWidth: 4, // Add a left border for emphasis
    borderLeftColor: '#ff9800',
    paddingLeft: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff', // White background for cards
    padding: 12,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  itemImage: {
    width: 70, // Slightly larger image
    height: 70,
    borderRadius: 10, // More rounded corners
    marginRight: 15,
    resizeMode: 'cover', // Ensure image covers the area
  },
  placeholderImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemOptions: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic', // Italicize options
  },
  itemTotalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100', // Orange color for subtotal
    marginTop: 5,
    textAlign: 'right', // Align subtotal to the right
  },
  infoSection: {
    marginTop: 25,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#444',
  },
  priceBox: {
    marginTop: 25,
    padding: 20, // Increased padding
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffe0b2',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 15,
    color: '#555',
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
  },
  discountValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#e74c3c', // Red for discount
  },
  priceSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 10,
  },
  totalText: {
    fontSize: 18, // Larger total text
    fontWeight: 'bold',
    color: '#e65100',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e65100',
  },
});

export default OrderDetail;