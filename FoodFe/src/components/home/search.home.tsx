import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { EvilIcons } from '@expo/vector-icons'; // ✅ Sử dụng đúng trong Expo

const SearchHome = () => {
  return (
    <TouchableOpacity style={styles.container}>
      <EvilIcons name="search" size={24} color="#666" />
      <Text style={styles.placeholderText}>
        <Text style={styles.highlight}>Deal Hot</Text> Hôm Nay Từ 0đ...
      </Text>
    </TouchableOpacity>
  );
};

export default SearchHome;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  placeholderText: {
    color: '#555',
    fontSize: 14,
    marginLeft: 8,
    flexShrink: 1,
  },
  highlight: {
    color: '#e53935',
    fontWeight: '600',
  },
});
