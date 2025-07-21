import { ImageBackground, StyleSheet, Text, View, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import SocialButton from "@/components/button/social.button";
import { APP_COLOR } from "@/utils/constant";

const { height } = Dimensions.get('window');

const WelcomePage = () => {
  const BACKGROUND_IMAGE_URL = '../../assets/auth/138a23b5bd60019ccaace384012b9726.jpg';

  return (
    <ImageBackground style={styles.background} source={{ uri: 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA1L2lzMTYwNjItaW1hZ2Uta3d2eWZrd3IuanBn.jpg' }}>
      <LinearGradient
        style={styles.gradientOverlay}
        colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        locations={[0, 0.6, 1]}
      >
        <View style={styles.container}>
          {/* Text Section */}
          <View style={styles.welcomeTextSection}>
            <Text style={styles.heading}>Chào mừng đến với Food App</Text>
            <Text style={styles.body}>Khám phá thế giới ẩm thực phong phú!</Text>
            <Text style={styles.footer}>
              Nền tảng giao đồ ăn số 1 Việt Nam
            </Text>
          </View>

          {/* Button Section */}
          <View style={styles.welcomeBtnSection}>
            <Text style={styles.orText}>Hoặc đăng nhập bằng</Text>

            <SocialButton />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Khác</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.navigate('/auth/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupPromptText}>Chưa có tài khoản?</Text>
              <Link href={"/auth/signup"} asChild>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.signupLinkText}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

// ... (Rest of your StyleSheet remains the same)
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 25,
    paddingVertical: height * 0.05,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  welcomeTextSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: height * 0.08,
  },
  heading: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  body: {
    fontSize: 22,
    color: APP_COLOR.ORANGE,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    fontSize: 17,
    color: "#E0E0E0",
    fontStyle: "italic",
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  welcomeBtnSection: {
    width: '100%',
    alignItems: 'center',
  },
  orText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
    marginBottom: 20,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#888',
  },
  dividerText: {
    paddingHorizontal: 15,
    fontSize: 15,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  signupPromptText: {
    color: "#E0E0E0",
    fontSize: 16,
    marginRight: 5,
  },
  signupLinkText: {
    color: APP_COLOR.ORANGE,
    fontSize: 16,
    fontWeight: '700',
    textDecorationLine: "underline",
  },
});

export default WelcomePage;