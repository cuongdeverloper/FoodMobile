import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Entypo } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useCurrentApp } from '@/context/app.context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

interface HeaderHomeProps {
  onMenuPress?: () => void;
}

interface Address {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
  lat?: number;
  lng?: number;
}

const HeaderHome: React.FC<HeaderHomeProps> = ({ onMenuPress }) => {
  const { appState } = useCurrentApp();
  const router = useRouter();
  const [defaultAddress, setDefaultAddress] = useState<string>("");

  useEffect(() => {
    loadDefaultAddress();
  }, []);

  // Refresh address when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadDefaultAddress();
    }, [])
  );

  const loadDefaultAddress = async () => {
    try {
      const savedAddresses = await AsyncStorage.getItem("user_addresses");
      console.log("🔍 Saved addresses:", savedAddresses);
      
      if (savedAddresses) {
        const addresses: Address[] = JSON.parse(savedAddresses);
        console.log("📋 Parsed addresses:", addresses);
        
        const defaultAddr = addresses.find(addr => addr.isDefault);
        console.log("⭐ Default address:", defaultAddr);
        
        if (defaultAddr) {
          setDefaultAddress(defaultAddr.address);
          console.log("✅ Set default address:", defaultAddr.address);
        } else {
          console.log("❌ No default address found");
        }
      } else {
        console.log("❌ No saved addresses found");
      }
    } catch (error) {
      console.error("Error loading default address:", error);
    }
  };

  // Use default address if available, otherwise fall back to appState address
  const address = defaultAddress || appState?.address;

  return (
    <View style={styles.container}>
      <View style={styles.rightSection}>
        <Text style={styles.title}>Giao đến:</Text>

        <TouchableOpacity 
          style={[styles.locationRow, address && styles.locationRowActive]}
          onPress={() => router.push("/address-management")}
        >
          <Entypo
            name="location-pin"
            size={20}
            color={address ? '#2e7d32' : '#999'}
            style={{ marginRight: 4 }}
          />
          <Text
            style={address ? styles.addressText : styles.noAddressText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {address || 'Chưa cập nhật địa chỉ'}
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={16} 
            color={address ? '#2e7d32' : '#999'} 
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HeaderHome;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    alignItems: 'flex-start',
  },
  menuButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f1f3f5',
    marginRight: 12,
  },
  rightSection: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#555',
    paddingBottom: 2,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
  },
  locationRowActive: {
    backgroundColor: '#e6f4ea',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  noAddressText: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});
