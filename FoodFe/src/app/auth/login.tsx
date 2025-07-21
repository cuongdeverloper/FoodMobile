import ShareBtn from "@/btn/shareBtn";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import { useState } from "react";
import Toast from "react-native-root-toast";
import { loginApi } from "@/utils/api";
import { Formik } from "formik";
import { LoginSchema } from "@/utils/validate.schema";
import { useCurrentApp } from "@/context/app.context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShareInput from "@/components/input/share.input";
import SocialButton from "@/components/button/social.button";

const LoginPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { setAppState } = useCurrentApp();

  const handleLogin = async (userLogin: string, password: string) => {
    try {
      setLoading(true);
      const res = await loginApi(userLogin, password);

      if (res.data && res.data.errorCode === 0) {
        const token = res.data.data?.access_token;
        if (token) {
          await AsyncStorage.setItem("access_token", token);
        }
        setAppState(res.data.data);
        Toast.show(res.data.message || 'Đăng nhập thành công! 👋', {
          duration: Toast.durations.LONG,
          position: Toast.positions.TOP,
          shadow: true,
          animation: true,
          hideOnPress: true,
          backgroundColor: '#00796B',
          textColor: '#fff',
        });
        router.replace('/');
      } else {
        Toast.show(res.data.message || 'Tên đăng nhập hoặc mật khẩu không đúng. 😔', {
          duration: Toast.durations.LONG,
          position: Toast.positions.TOP,
          backgroundColor: '#D84315',
          textColor: '#fff',
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      Toast.show('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại. 😟', {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        backgroundColor: '#D32F2F',
        textColor: '#fff',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Formik
        initialValues={{ userLogin: '', password: '' }}
        onSubmit={values => handleLogin(values.userLogin, values.password)}
        validationSchema={LoginSchema}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.container}>
            <Text style={styles.headerText}>Chào mừng trở lại! 👋</Text>

            <View style={styles.formContainer}>
              <ShareInput
                title="Tài khoản"
                placeholder="Email hoặc tên người dùng"
                keyboardType="email-address"
                onChangeText={handleChange('userLogin')}
                onBlur={handleBlur('userLogin')}
                value={values.userLogin}
                error={touched.userLogin && errors.userLogin ? errors.userLogin : undefined}
                iconName="person-outline"
                inputContainerStyle={styles.inputContainerStyle}
              />
              <ShareInput
                title="Mật khẩu"
                placeholder="Nhập mật khẩu của bạn"
                secureTextEntry={true}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                error={touched.password && errors.password ? errors.password : undefined}
                iconName="lock-closed-outline"
                inputContainerStyle={styles.inputContainerStyle}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <View style={styles.loginButtonWrapper}>
                <ShareBtn
                  loading={loading}
                  title="Đăng nhập"
                  onPress={handleSubmit as any}
                  textStyle={styles.loginButtonText}
                  buttonStyle={styles.loginButton}
                />
              </View>
            </View>

            <View style={styles.socialLoginSection}>
              <View style={styles.divider} />
              <Text style={styles.socialLoginText}>Hoặc đăng nhập bằng</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <SocialButton iconName="logo-google" onPress={() => console.log('Google Login')} />
              <SocialButton iconName="logo-facebook" onPress={() => console.log('Facebook Login')} />
              <SocialButton iconName="logo-apple" onPress={() => console.log('Apple Login')} />
            </View>

            <View style={styles.signupSection}>
              <Text style={styles.signupText}>
                Chưa có tài khoản?
              </Text>
              <Link href={"/auth/signup"} asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>
                    Đăng ký ngay
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        )}
      </Formik>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 28,
  },
  inputContainerStyle: {
    borderRadius: 10,
    backgroundColor: '#F0F2F5',
    borderWidth: 1,
    borderColor: '#CFD8DC',
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#00796B',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonWrapper: {
    marginTop: 6,
  },
  loginButton: {
    backgroundColor: '#00796B',
    borderRadius: 10,
    paddingVertical: 14,
    shadowColor: '#00796B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  socialLoginSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#B0BEC5',
  },
  socialLoginText: {
    fontSize: 14,
    color: '#757575',
    marginHorizontal: 12,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 32,
  },
  signupSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: '#555555',
  },
  signupLink: {
    fontSize: 15,
    color: '#00796B',
    fontWeight: '700',
    marginLeft: 6,
  },
});

export default LoginPage;
