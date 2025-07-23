import CustomFlatList from "@/components/CustomFLatList";
import { SafeAreaView } from "react-native";
import styles from '../styles';
import HeaderHome from "@/components/home/header.home";
import SearchHome from "@/components/home/search.home";
import TopListHome from "@/components/home/top.list.home";
import CollectionHome from "@/components/home/collection.home";
import { useCurrentApp } from "@/context/app.context";
import React from "react";

const datax = [
  {
    key: 1,
    name: "Top Quán Rating 5* tuần này",
    description: "Gợi ý quán được tín đồ ẩm thực đánh giá 5*",
    refAPI: "top-rating"
  },
  {
    key: 2,
    name: "Quán Mới Lên Sàn",
    description: "Khám phá ngay hàng loạt quán mới cực ngon",
    refAPI: "newcomer"
  },
  {
    key: 3,
    name: "Ăn Thoả Thích, Freeship 0Đ",
    description: "Bánh ngọt, chân gà, bánh tráng trộn ... FreeShip.",
    refAPI: "top-freeship"
  },
];

const Index = () => {
  const { setTheme } = useCurrentApp();

  return (
    <SafeAreaView style={{ marginTop: 30, flex: 1 }}>
      <CustomFlatList
        data={datax}
        style={styles.list}
        renderItem={({ item }) => (
          <CollectionHome
            name={item.name}
            description={item.description}
            refAPI={item.refAPI}
          />
        )}
        StickyElementComponent={<SearchHome />}
        HeaderComponent={<HeaderHome />}
        TopListElementComponent={<TopListHome />}
      />
    </SafeAreaView>
  );
};

export default Index;
