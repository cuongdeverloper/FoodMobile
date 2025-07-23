
import { Button, Text, View } from 'react-native';
import { NavigationContainer, useLinkBuilder, useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './src/app/auth/login';
import 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { Ionicons } from '@expo/vector-icons';
import Home from './src/app/(tabs)/index';
import Like from './src/app/(tabs)/favourite';
import LikeDetail from './src/app/(tabs)/favourite';

export default function App() {
  const Stack = createNativeStackNavigator();
  const Drawer = createDrawerNavigator();
  const Tab = createBottomTabNavigator();

  // function HomeScreen(props: any) {
  //   const navigation: any = useNavigation();
  //   return (
  //     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
  //       <Text>Home Screen</Text>
  //       <Button
  //         onPress={() => navigation.navigate('Detail', { userId: 1, name: "cuong" })}
  //         title='Go detail' />
  //     </View>
  //   )
  // }
  function DetailsScreen() {
    const route: any = useRoute();
    const navigation: any = useNavigation();
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Detail Screen123</Text>
        <Text>{route?.params?.name}</Text>
        <Button
          onPress={() => navigation.navigate('Login')}
          title='Go Login' />
        <Button
          onPress={() => navigation.goBack()}
          title='Go back home' />
      </View>
    )
  }

  const TabApp = () => {
    return(
      <Tab.Navigator>
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Like" component={Like} />
      </Tab.Navigator>
    )
  }
  
  const StackApp = () =>{
    return(
      <Stack.Navigator>
        <Stack.Screen name="Home" 
        component={TabApp} 
        options={{title:'Trang chu',headerShown:false}}/>
        <Stack.Screen name="LikeDetail" 
        component={LikeDetail} 
        options={{title:'Like'}}/>
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen
          name="Detail"
          component={DetailsScreen}
          options={({ route }: { route: any }) => ({
            headerTitle: `Detail title ${route?.params?.name}`,

            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            }
          })} />
      </Stack.Navigator>
    )
  }
  function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();
    const { buildHref } = useLinkBuilder();
 const getIconName = (routeName: string, isFocused: boolean) => {
    switch (routeName) {
      case 'Home':
        return isFocused ? 'home' : 'home-outline';
      case 'Detail':
        return isFocused ? 'information-circle' : 'information-circle-outline';
      default:
        return 'ellipse';
    }
  };
    return (
      
      <View style={{ flexDirection: 'row' }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <PlatformPressable
              href={buildHref(route.name, route.params)}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1 }}
               key={route.key}
            >
               <Ionicons
              name={getIconName(route.name, isFocused)}
              size={24}
              color={isFocused ? 'green' : 'gray'}
            />
              <Text style={{ color: isFocused ? 'green' : colors.text }}>
                {typeof label === 'function' ? (
                  label({
                    focused: isFocused,
                    color: isFocused ? 'green' : colors.text,
                    position: 'below-icon',
                    children: route.name,
                  })
                ) : (
                  <Text style={{ color: isFocused ? 'green' : colors.text }}>
                    {label}
                  </Text>
                )}

              </Text>
            </PlatformPressable>
          );
        })}
      </View>
    );
  }
  return (
    <NavigationContainer>
       <Drawer.Navigator>
      <Drawer.Screen name="StackApp" component={StackApp} />
      <Drawer.Screen name="Login" component={LoginPage} />
      <Drawer.Screen name="Like" component={Like} />
    </Drawer.Navigator> 
    </NavigationContainer>
  );
}


