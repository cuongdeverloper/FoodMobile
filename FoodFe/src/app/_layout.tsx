import AppProvider from "@/context/app.context";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router"
import { SafeAreaView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RootSiblingParent } from 'react-native-root-siblings';
const RootLayout = () => {
  const navTheme = {
    ...DefaultTheme,
    color: {
      ...DefaultTheme.colors,
      background: 'transparent',
    }
  }
  return (
    <GestureHandlerRootView>
      <RootSiblingParent>
        <AppProvider>
          <SafeAreaView style={{ flex: 1 }}>
          {/* <ThemeProvider value={DarkTheme}> */}
          <ThemeProvider value={navTheme}>
            <Stack screenOptions={{
              headerStyle: {
                backgroundColor: '#f4511e',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" options={{ headerShown: false }} />
              <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
              <Stack.Screen name="auth/welcome" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="CartPage" options={{ headerShown: false }} />
              <Stack.Screen name="product/MenuItemDetail" options={{ headerShown: false }} />
              <Stack.Screen name="order/[id]" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>

          </SafeAreaView>
        </AppProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  )
}
export default RootLayout