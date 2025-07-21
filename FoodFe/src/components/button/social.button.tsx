import { Image, StyleSheet, Text, View } from "react-native"
import bg from '@/assets/auth/138a23b5bd60019ccaace384012b9726.jpg';
import fblogo from '@/assets/auth/fb.png';
import gglogo from '@/assets/auth/gg.png';
import ShareBtn from "@/btn/shareBtn";
const styles = StyleSheet.create({
  welcomeText: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  welcomeBtn: {
    flex: 0.4,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 36,
    fontWeight: "700",
    color: "#333",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  body: {
    fontSize: 20,
    color: "orange",
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    fontSize: 16,
    color: "#333",
    marginTop: 8,
    fontStyle: "italic",
    textAlign: 'center',
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginVertical: 20,
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
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 10,
    textTransform: "uppercase",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginHorizontal: 40,
    marginBottom: 20,
    marginTop: 10,
  },
  dividerText: {
    textAlign: "center",
    backgroundColor: "#fff",
    alignSelf: "center",
    position: "relative",
    top: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "500",
    color: "#444",
  }, emailBtnWrapper: {
    alignSelf: 'center',
    marginTop: 10,
  },
  emailBtn: {
    justifyContent: "center",
    borderRadius: 20,
    marginHorizontal: 50,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: "#fff",
    elevation: 3,
  },
  emailBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  }
})
const SocialButton = () => {
  return (
    <View style={styles.welcomeBtn}>
      <View style={styles.divider}>
        <Text style={styles.dividerText}>Login by</Text>
      </View>

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

      


    </View>
  )
}
export default SocialButton