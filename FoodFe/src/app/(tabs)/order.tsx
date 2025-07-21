import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  ActivityIndicator, 
  Image, 
  Modal, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface OrderItem {
  itemId: string;
  title: string;
  quantity: number;
  basePrice: number;
  options: { title: string; additionalPrice: number }[];
  image?: string;
}

interface OrderType {
  _id: string;
  items: OrderItem[];
  total: number;
  address: string;
  phone: string;
  status: 'pending' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: string;
  promoCode?: string;
  discount?: number;
}

const STATUS_MAP: Record<OrderType['status'], { label: string; color: string; bgColor: string; icon: string }> = {
  pending: { label: "Đang chuẩn bị", color: "#ff9800", bgColor: "#fff3e0", icon: "time-outline" },
  delivering: { label: "Đang giao hàng", color: "#2196f3", bgColor: "#e3f2fd", icon: "bicycle-outline" },
  delivered: { label: "Đã giao hàng", color: "#4caf50", bgColor: "#e8f5e8", icon: "checkmark-circle-outline" },
  cancelled: { label: "Đã hủy", color: "#e53935", bgColor: "#ffebee", icon: "close-circle-outline" },
};

const Order = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
  const [checkingReviews, setCheckingReviews] = useState(false);
  const router = useRouter();

  const API_BASE_URL = process.env.EXPO_PUBLIC_ANDROID_API_URL || process.env.EXPO_PUBLIC_IOS_API_URL;

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const res = await axios.get(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  const handleCancelOrder = async (orderId: string) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn hủy đơn hàng này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("access_token");
              await axios.patch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("Đã hủy đơn hàng.");
              fetchOrders(); // Refresh list
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy đơn hàng.");
            }
          },
          style: "destructive",
        }
      ]
    );
  };
  const handleFinishOrder = async (orderId: string) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn hoàn thành đơn hàng này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hoàn thành đơn",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("access_token");
              await axios.patch(`${API_BASE_URL}/api/orders/${orderId}/finish`, {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("Đã hoàn thành đơn hàng.");
              fetchOrders(); // Refresh list
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hoàn thành đơn hàng.");
            }
          },
          style: "destructive",
        }
      ]
    );
  };
  const checkReviewedOrders = async () => {
    if (orders.length === 0) return;
    
    setCheckingReviews(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const tokenData = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const userId = tokenData?.id;

      if (!userId) return;

      const reviewedSet = new Set<string>();

      // Check each delivered order (not cancelled)
      for (const order of orders.filter(o => o.status === 'delivered')) {
        try {
          // Check if user has reviewed any item in this order
          const reviewPromises = order.items.map(item => 
            axios.get(`${API_BASE_URL}/api/reviews/${item.itemId}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          );

          const reviewResponses = await Promise.all(reviewPromises);
          const hasReviewed = reviewResponses.some(response => 
            response.data.data.some((review: any) => review.userId._id === userId)
          );

          if (hasReviewed) {
            reviewedSet.add(order._id);
          }
        } catch (error) {
          console.log(`Error checking reviews for order ${order._id}:`, error);
        }
      }

      setReviewedOrders(reviewedSet);
    } catch (error) {
      console.log('Error checking reviewed orders:', error);
    } finally {
      setCheckingReviews(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0 && tab === 'history') {
      checkReviewedOrders();
    }
  }, [orders, tab]);

  const upcomingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'delivering');
  const historyOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const handleRateOrder = (order: OrderType) => {
    // Only allow rating for delivered orders
    if (order.status !== 'delivered') {
      Alert.alert("Không thể đánh giá", "Chỉ có thể đánh giá đơn hàng đã được giao thành công.");
      return;
    }
    
    setSelectedOrder(order);
    setReviewRating(0);
    setReviewText("");
    setShowReviewModal(true);
  };

  const handleReOrder = (order: OrderType) => {
    // Navigate to the first item in the order
    if (order.items.length > 0) {
      const firstItem = order.items[0];
      router.push({
        pathname: "/product/MenuItemDetail",
        params: { id: firstItem.itemId._id },
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao!");
      return;
    }

    if (!selectedOrder) return;

    setSubmittingReview(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      
      // Submit review for each item in the order
      const reviewPromises = selectedOrder.items.map(item => 
        axios.post(`${API_BASE_URL}/api/reviews`, {
          itemId: item.itemId,
          rating: reviewRating,
          comment: reviewText,
        }, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      );

      await Promise.all(reviewPromises);
      
      // Add this order to reviewed orders set
      setReviewedOrders(prev => new Set([...prev, selectedOrder._id]));
      
      Alert.alert("Thành công", "Cảm ơn bạn đã đánh giá đơn hàng!");
      setShowReviewModal(false);
      setSelectedOrder(null);
      setReviewRating(0);
      setReviewText("");
    } catch (err: any) {
      Alert.alert("Lỗi", err?.response?.data?.message || "Không thể gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrder = (order: OrderType, isUpcoming = false) => {
    const firstItem = order.items[0];
    const isReviewed = reviewedOrders.has(order._id);
    const canReview = order.status === 'delivered' && !isReviewed;
    const statusInfo = STATUS_MAP[order.status];
    
    return (
      <Pressable key={order._id} onPress={() => router.push(`/order/${order._id}`)} >
      <View key={order._id} style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          {firstItem?.image ? (
            <Image 
              source={{ uri: `${API_BASE_URL}/uploads/${firstItem.image}` }} 
              style={styles.itemImage} 
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="fast-food-outline" size={24} color="#ccc" />
            </View>
          )}
          <View style={styles.itemInfo}>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {firstItem?.title || 'Sản phẩm'}
            </Text>
            <Text style={styles.itemCount}>
              {order.items.length} món • {order.total.toLocaleString()}đ
            </Text>
          </View>
        </View>

        {/* Order Actions */}
        <View style={styles.orderActions}>
          {isUpcoming ? (
   <Pressable style={styles.cancelBtn} onPress={() => handleCancelOrder(order._id)}>
   <Ionicons name="close-circle-outline" size={18} color="#e53935" />
   <Text style={styles.cancelBtnText}>Hủy đơn</Text>
 </Pressable>
          ) : (
            <>
              {order.status === 'cancelled' ? (
                <View style={styles.cancelledBtn}>
                  <Ionicons name="close-circle" size={18} color="#e53935" />
                  <Text style={styles.cancelledBtnText}>Đã hủy</Text>
                </View>
              ) : isReviewed ? (
                <View style={styles.ratedBtn}>
                  <Ionicons name="checkmark-circle" size={18} color="#4caf50" />
                  <Text style={styles.ratedBtnText}>Đã đánh giá</Text>
                </View>
              ) : (
                <Pressable 
                  style={[styles.rateBtn, !canReview && styles.disabledBtn]}
                  onPress={() => handleRateOrder(order)}
                  disabled={!canReview}
                >
                  <Ionicons name="star-outline" size={18} color={canReview ? "#2196f3" : "#ccc"} />
                  <Text style={[styles.rateBtnText, { color: canReview ? "#2196f3" : "#ccc" }]}>Đánh giá</Text>
                </Pressable>
              )}
            </>
          )}
          
          <Pressable 
            style={styles.reorderBtn}
            onPress={() => isUpcoming ? handleFinishOrder(order._id) : handleReOrder(order)}
          >
            <Ionicons name={isUpcoming ? "checkmark-done-outline" : "refresh-outline"} size={18} color="#fff" />
            <Text style={styles.reorderBtnText}>
              {isUpcoming ? 'Hoàn thành' : 'Mua lại'}
            </Text>
          </Pressable>
        </View>
      </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable 
          style={[styles.tabButton, tab === 'upcoming' && styles.tabButtonActive]} 
          onPress={() => setTab('upcoming')}
        >
          <Ionicons 
            name="time-outline" 
            size={20} 
            color={tab === 'upcoming' ? "#fff" : "#666"} 
          />
          <Text style={[styles.tabText, tab === 'upcoming' && styles.tabTextActive]}>
            Đang xử lý ({upcomingOrders.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tabButton, tab === 'history' && styles.tabButtonActive]} 
          onPress={() => setTab('history')}
        >
          <Ionicons 
            name="receipt-outline" 
            size={20} 
            color={tab === 'history' ? "#fff" : "#666"} 
          />
          <Text style={[styles.tabText, tab === 'history' && styles.tabTextActive]}>
            Lịch sử ({historyOrders.length})
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff9800" />
          <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {tab === 'upcoming' && (
            <>
              {upcomingOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="time-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyTitle}>Chưa có đơn hàng đang xử lý</Text>
                  <Text style={styles.emptySubtitle}>Hãy đặt hàng để xem trạng thái tại đây</Text>
                </View>
              ) : (
                upcomingOrders.map(order => renderOrder(order, true))
              )}
            </>
          )}
          
          {tab === 'history' && (
            <>
              {checkingReviews && (
                <View style={styles.checkingReviews}>
                  <ActivityIndicator size="small" color="#ff9800" />
                  <Text style={styles.checkingText}>Đang kiểm tra đánh giá...</Text>
                </View>
              )}
              
              {historyOrders.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyTitle}>Chưa có lịch sử đơn hàng</Text>
                  <Text style={styles.emptySubtitle}>Các đơn hàng đã hoàn thành sẽ hiển thị tại đây</Text>
                </View>
              ) : (
                historyOrders.map(order => renderOrder(order, false))
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Review Modal */}
      <Modal
        visible={showReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReviewModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đánh giá đơn hàng</Text>
              <Pressable onPress={() => setShowReviewModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              Đánh giá cho {selectedOrder?.items.length} món ăn
            </Text>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Chọn số sao:</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setReviewRating(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= reviewRating ? "star" : "star-outline"}
                      size={36}
                      color="#FFD700"
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              placeholder="Viết bình luận của bạn..."
              value={reviewText}
              onChangeText={setReviewText}
              style={styles.reviewInput}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowReviewModal(false)}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.submitModalButton]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
  },
  tabButtonActive: {
    backgroundColor: '#ff9800',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  checkingReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 12,
  },
  cancelBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#e53935',
  },
  rateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderRadius: 12,
  },
  rateBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledBtn: {
    backgroundColor: '#f8f9fa',
    borderColor: '#ddd',
  },
  ratedBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 12,
  },
  ratedBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#4caf50',
  },
  cancelledBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#e53935',
    borderRadius: 12,
  },
  cancelledBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#e53935',
  },
  reorderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ff9800',
    borderRadius: 12,
  },
  reorderBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#fafafa',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelModalButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  submitModalButton: {
    backgroundColor: '#ff9800',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Order;