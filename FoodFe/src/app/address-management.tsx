import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import axios from "axios";
import MapView, { Marker } from "react-native-maps";
import { reverseGeocode } from "../utils/nominatim";

interface Address {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

const AddressManagementScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    isDefault: false,
  });

  const API_BASE_URL =
    Platform.OS === "android"
      ? process.env.EXPO_PUBLIC_ANDROID_API_URL
      : process.env.EXPO_PUBLIC_IOS_API_URL;

  useEffect(() => {
    fetchAddresses();
    // Add test address if no addresses exist
    addTestAddressIfNeeded();
  }, []);

  const addTestAddressIfNeeded = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem("user_addresses");
      if (!savedAddresses) {
        const testAddress: Address = {
          id: "test-1",
          name: "Nhà riêng",
          address: "K39 Nguyễn Nhàn, Hòa Thọ Đông, Cẩm Lệ, Đà Nẵng",
          phone: "0901903222",
          isDefault: true,
        };
        
        console.log("🧪 Adding test address:", testAddress);
        await saveAddressesToStorage([testAddress]);
        setAddresses([testAddress]);
      }
    } catch (error) {
      console.error("Error adding test address:", error);
    }
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await axios.get(`${API_BASE_URL}/api/users/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.status === 'success') {
        setAddresses(response.data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      // If API doesn't exist yet, use local storage
      loadAddressesFromStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadAddressesFromStorage = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem("user_addresses");
      if (savedAddresses) {
        setAddresses(JSON.parse(savedAddresses));
      }
    } catch (error) {
      console.error("Error loading addresses from storage:", error);
    }
  };

  const saveAddressesToStorage = async (addressList: Address[]) => {
    try {
      console.log("💾 Saving addresses to storage:", addressList);
      await AsyncStorage.setItem("user_addresses", JSON.stringify(addressList));
      console.log("✅ Addresses saved successfully");
    } catch (error) {
      console.error("Error saving addresses to storage:", error);
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

  const handleLocationSelect = async (location: {lat: number, lng: number}) => {
    setSelectedLocation(location);
    setMapVisible(false);
    
    try {
      const formatted = await reverseGeocode(location.lat, location.lng);
      setFormData(prev => ({
        ...prev,
        address: formatted
      }));
    } catch (error: any) {
      console.error("Lỗi reverseGeocode:", error);
      // Fallback to coordinates if reverse geocoding fails
      setFormData(prev => ({
        ...prev,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
      }));
    }
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      name: "",
      address: "",
      phone: "",
      isDefault: false,
    });
    setSelectedLocation(null);
    setModalVisible(true);
  };

  const openEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      address: address.address,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    if (address.lat && address.lng) {
      setSelectedLocation({ lat: address.lat, lng: address.lng });
    }
    setModalVisible(true);
  };

  const handleSaveAddress = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên địa chỉ");
      return;
    }

    if (!formData.address.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập địa chỉ");
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập số điện thoại");
      return;
    }

    try {
      const newAddress: Address = {
        id: editingAddress?.id || Date.now().toString(),
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        isDefault: formData.isDefault,
        lat: selectedLocation?.lat,
        lng: selectedLocation?.lng,
      };

      let updatedAddresses: Address[];

      if (editingAddress) {
        // Edit existing address
        updatedAddresses = addresses.map(addr => 
          addr.id === editingAddress.id ? newAddress : addr
        );
      } else {
        // Add new address
        updatedAddresses = [...addresses, newAddress];
      }

      // If this address is set as default, unset others
      if (formData.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr.id === newAddress.id
        }));
      }

      // Save to API if available, otherwise use local storage
      try {
        const token = await AsyncStorage.getItem("access_token");
        await axios.put(`${API_BASE_URL}/api/users/addresses`, {
          addresses: updatedAddresses
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        // Fallback to local storage
        await saveAddressesToStorage(updatedAddresses);
      }

      setAddresses(updatedAddresses);
      setModalVisible(false);
      
      // Always save to local storage for immediate sync with other screens
      await saveAddressesToStorage(updatedAddresses);
      
      Alert.alert("Thành công", editingAddress ? "Cập nhật địa chỉ thành công!" : "Thêm địa chỉ thành công!");
    } catch (error) {
      console.error("Error saving address:", error);
      Alert.alert("Lỗi", "Không thể lưu địa chỉ");
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa địa chỉ này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
            setAddresses(updatedAddresses);
            
            try {
              const token = await AsyncStorage.getItem("access_token");
              await axios.put(`${API_BASE_URL}/api/users/addresses`, {
                addresses: updatedAddresses
              }, {
                headers: { Authorization: `Bearer ${token}` },
              });
            } catch (error) {
              // Fallback to local storage
            }
            
            // Always save to local storage for immediate sync
            await saveAddressesToStorage(updatedAddresses);
          }
        }
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));

    setAddresses(updatedAddresses);
    
    try {
      const token = await AsyncStorage.getItem("access_token");
      await axios.put(`${API_BASE_URL}/api/users/addresses`, {
        addresses: updatedAddresses
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      // Fallback to local storage
    }
    
    // Always save to local storage for immediate sync
    await saveAddressesToStorage(updatedAddresses);
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View style={styles.addressItem}>
      <View style={styles.addressContent}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressName}>{item.name}</Text>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Mặc định</Text>
            </View>
          )}
        </View>
        <Text style={styles.addressText}>{item.address}</Text>
        <Text style={styles.phoneText}>{item.phone}</Text>
      </View>
      
      <View style={styles.addressActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="star-outline" size={20} color="#ff9800" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditAddress(item)}
        >
          <Ionicons name="create-outline" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAddress(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Địa chỉ giao hàng</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ff9800" />
              <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
            </View>
          ) : (
            <>
              {/* Address List */}
              <FlatList
                data={addresses}
                renderItem={renderAddressItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.addressList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Ionicons name="location-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>Chưa có địa chỉ nào</Text>
                    <Text style={styles.emptySubtext}>Thêm địa chỉ đầu tiên để bắt đầu</Text>
                  </View>
                }
              />

              {/* Add Address Button */}
              <TouchableOpacity style={styles.addButton} onPress={openAddAddress}>
                <Ionicons name="add" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Add/Edit Address Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButton}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingAddress ? "Chỉnh sửa địa chỉ" : "Thêm địa chỉ mới"}
              </Text>
              <TouchableOpacity onPress={handleSaveAddress}>
                <Text style={styles.saveButton}>Lưu</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên địa chỉ *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                  placeholder="VD: Nhà riêng, Công ty"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ *</Text>
                <View style={styles.addressInputContainer}>
                  <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                    placeholder="Nhập địa chỉ chi tiết"
                    placeholderTextColor="#999"
                    multiline
                  />
                  <TouchableOpacity style={styles.mapButton} onPress={openMap}>
                    <Ionicons name="map-outline" size={20} color="#ff9800" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.phone}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>

              {/* Set as Default */}
              <TouchableOpacity
                style={styles.defaultOption}
                onPress={() => setFormData(prev => ({ ...prev, isDefault: !prev.isDefault }))}
              >
                <Ionicons
                  name={formData.isDefault ? "star" : "star-outline"}
                  size={24}
                  color={formData.isDefault ? "#ff9800" : "#ccc"}
                />
                <Text style={styles.defaultOptionText}>Đặt làm địa chỉ mặc định</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* Map Modal */}
        <Modal
          visible={mapVisible}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <SafeAreaView style={styles.mapContainer}>
            <View style={styles.mapHeader}>
              <TouchableOpacity onPress={() => setMapVisible(false)}>
                <Text style={styles.cancelButton}>Hủy</Text>
              </TouchableOpacity>
              <Text style={styles.mapTitle}>Chọn vị trí</Text>
              <TouchableOpacity onPress={() => selectedLocation && handleLocationSelect(selectedLocation)}>
                <Text style={styles.confirmButton}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
            
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: selectedLocation?.lat || 16.054407,
                longitude: selectedLocation?.lng || 108.202167,
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
              <TouchableOpacity
                onPress={async () => {
                  if (!selectedLocation) {
                    Alert.alert("Thông báo", "Vui lòng chọn một vị trí trên bản đồ.");
                    return;
                  }
                  await handleLocationSelect(selectedLocation);
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
              </TouchableOpacity>

              <TouchableOpacity
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
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2c3e50",
  },
  
  content: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
  
  addressList: {
    padding: 20,
  },
  
  addressItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  addressContent: {
    flex: 1,
  },
  
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  
  defaultBadge: {
    backgroundColor: "#ff9800",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  defaultText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  
  addressText: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 4,
  },
  
  phoneText: {
    fontSize: 14,
    color: "#6c757d",
  },
  
  addressActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 12,
  },
  
  actionButton: {
    padding: 8,
  },
  
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6c757d",
    marginTop: 16,
  },
  
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  
  addButton: {
    backgroundColor: "#ff9800",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#ff9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  
  cancelButton: {
    fontSize: 16,
    color: "#6c757d",
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff9800",
  },
  
  modalContent: {
    flex: 1,
    padding: 20,
  },
  
  inputGroup: {
    marginBottom: 24,
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  
  textInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2c3e50",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  
  mapButton: {
    padding: 4,
  },
  
  defaultOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  
  defaultOptionText: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 12,
  },
  
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  
  mapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  
  confirmButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff9800",
  },
  

});

export default AddressManagementScreen; 