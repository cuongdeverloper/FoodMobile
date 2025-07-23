import React from "react";
import { ImageBackground, StyleSheet, Text, View, Dimensions, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router";
import SocialButton from "@/components/button/social.button";
import { APP_COLOR } from "@/utils/constant";

const { height } = Dimensions.get('window');

const WelcomePage = () => {
  return (
    <ImageBackground
      style={styles.background}
      source={require('@/assets/auth/background.jpg')}
      resizeMode="cover"
    >
      <LinearGradient
        style={styles.gradientOverlay}
        colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.5, 1]}
      >
        <View style={styles.container}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image source={require('@/assets/icon.png')} style={styles.logo} />
          </View>

          {/* Text Section */}
          <View style={styles.welcomeTextSection}>
            <Text style={styles.heading}>Chào mừng đến với Food App</Text>
            <Text style={styles.body}>Khám phá thế giới ẩm thực phong phú!</Text>
            <Text style={styles.footer}>Nền tảng giao đồ ăn số 1 Việt Nam</Text>
          </View>

          {/* Button Section */}
          <View style={styles.welcomeBtnSection}>
            <Text style={styles.orText}>Đăng nhập bằng mạng xã hội</Text>
            <SocialButton />
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.navigate('/auth/login')}
              activeOpacity={0.85}
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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: height * 0.04,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: height * 0.03,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: '#fff',
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  welcomeTextSection: {
    alignItems: 'center',
    marginBottom: height * 0.07,
  },
  heading: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  body: {
    fontSize: 20,
    color: APP_COLOR.ORANGE,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    fontSize: 16,
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
    marginBottom: 10,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  orText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
    marginBottom: 18,
    marginTop: 2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1.2,
    backgroundColor: '#888',
    borderRadius: 1,
    marginHorizontal: 8,
  },
  dividerText: {
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  loginButton: {
    width: '100%',
    backgroundColor: APP_COLOR.ORANGE,
    paddingVertical: 15,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 18,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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