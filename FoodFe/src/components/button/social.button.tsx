import React from "react";
import { Image, StyleSheet, View } from "react-native";
import fblogo from '@/assets/auth/fb.png';
import gglogo from '@/assets/auth/gg.png';
import ShareBtn from "@/btn/shareBtn";

const styles = StyleSheet.create({
  btnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: 'center',
    marginVertical: 10,
  },
  btnContent: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 10,
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 10,
    textTransform: "uppercase",
  },
});

const SocialButton = () => {
  return (
    <View style={styles.btnContainer}>
      <ShareBtn
        title="facebook"
        onPress={() => alert('facebook')}
        textStyle={styles.btnText}
        buttonStyle={styles.btnContent}
        icons={<Image source={fblogo} style={{ width: 24, height: 24 }} />}
      />
      <ShareBtn
        title="google"
        onPress={() => alert('google')}
        textStyle={styles.btnText}
        buttonStyle={styles.btnContent}
        icons={<Image source={gglogo} style={{ width: 24, height: 24 }} />}
      />
    </View>
  );
};

export default SocialButton;