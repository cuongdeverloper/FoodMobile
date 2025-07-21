import ShareBtn from "@/btn/shareBtn";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, router } from "expo-router";
import Toast from "react-native-root-toast";
import { registerApi } from "@/utils/api";
import { Formik } from "formik";
import { SignUpSchema } from "@/utils/validate.schema";
import ShareInput from "@/components/input/share.input";
import SocialButton from "@/components/button/social.button";

const SignUpPage = () => {
  const handleSignUp = async (username: string, userLogin: string, password: string) => {
    try {
      const res = await registerApi(username, userLogin, password);
      Toast.show(res.data.message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        backgroundColor: res.data.errorCode === 0 ? "#00796B" : "#D32F2F",
        textColor: "#fff",
      });

      if (res.data.errorCode === 0) {
        router.replace("/");
      }
    } catch (error) {
      Toast.show("Lỗi kết nối. Vui lòng thử lại!", {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        backgroundColor: "#D32F2F",
        textColor: "#fff",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Formik
        initialValues={{ username: "", userLogin: "", password: "" }}
        onSubmit={(values) => handleSignUp(values.username, values.userLogin, values.password)}
        validationSchema={SignUpSchema}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.container}>
            <Text style={styles.header}>Tạo tài khoản mới</Text>

            <View style={styles.formContainer}>
              <ShareInput
                title="Tên hiển thị"
                placeholder="VD: Nguyễn Văn A"
                onChangeText={handleChange("username")}
                onBlur={handleBlur("username")}
                value={values.username}
                error={touched.username && errors.username ? errors.username : undefined}
                inputContainerStyle={styles.inputContainerStyle}
              />
              <ShareInput
                title="Email hoặc Tên đăng nhập"
                placeholder="VD: example@gmail.com"
                keyboardType="email-address"
                onChangeText={handleChange("userLogin")}
                onBlur={handleBlur("userLogin")}
                value={values.userLogin}
                error={touched.userLogin && errors.userLogin ? errors.userLogin : undefined}
                inputContainerStyle={styles.inputContainerStyle}
              />
              <ShareInput
                title="Mật khẩu"
                placeholder="Nhập mật khẩu tối thiểu 6 ký tự"
                secureTextEntry
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                error={touched.password && errors.password ? errors.password : undefined}
                inputContainerStyle={styles.inputContainerStyle}
              />
            </View>

            <View style={styles.submitButtonWrapper}>
              <ShareBtn
                title="Đăng ký"
                onPress={handleSubmit as () => void}
                textStyle={styles.submitButtonText}
                buttonStyle={styles.submitButton}
              />
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc đăng ký bằng</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <SocialButton iconName="logo-google" onPress={() => console.log('Google')} />
              <SocialButton iconName="logo-facebook" onPress={() => console.log('Facebook')} />
              <SocialButton iconName="logo-apple" onPress={() => console.log('Apple')} />
            </View>

            <View style={styles.loginLinkWrapper}>
              <Text style={styles.loginText}>Đã có tài khoản?</Text>
              <Link href="/auth/login" asChild>
                <Text style={styles.loginLink}>Đăng nhập</Text>
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
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212121",
    textAlign: "center",
    marginBottom: 28,
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  inputContainerStyle: {
    borderRadius: 10,
    backgroundColor: "#F0F2F5",
    borderWidth: 1,
    borderColor: "#CFD8DC",
    paddingHorizontal: 15,
    height: 52,
    marginBottom: 16,
  },
  submitButtonWrapper: {
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: "#00796B",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#00796B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#B0BEC5",
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#757575",
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  loginLinkWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  loginText: {
    fontSize: 14,
    color: "#757575",
  },
  loginLink: {
    fontSize: 14,
    color: "#00796B",
    fontWeight: "600",
    marginLeft: 6,
  },
});

export default SignUpPage;
