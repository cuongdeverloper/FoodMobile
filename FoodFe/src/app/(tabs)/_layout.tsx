import { Tabs } from "expo-router";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const TabsLayout = () => {
    const getIcons = (routeName: string, focused: boolean, size: number) => {
        const color = focused ? 'orange' : 'grey';

        switch (routeName) {
            case "index":
                return (
                    <MaterialCommunityIcons
                        name="food-fork-drink"
                        size={size}
                        color={color}
                    />
                );
            case "order":
                return (
                    <MaterialCommunityIcons
                        name="clipboard-text-clock"
                        size={size}
                        color={color}
                    />
                );
            case "favourite":
                return (
                    <MaterialCommunityIcons
                        name="heart-outline"
                        size={size}
                        color={color}
                    />
                );
            case "notification":
                return (
                    <MaterialCommunityIcons
                        name="bell-outline"
                        size={size}
                        color={color}
                    />
                );
            case "account":
                return (
                    <MaterialCommunityIcons
                        name="account-circle-outline"
                        size={size}
                        color={color}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    return getIcons(route.name, focused, size);
                },
                headerShown: false,
                tabBarLabelStyle: { paddingBottom: 3 },
                tabBarActiveTintColor: 'orange',
            })}
        >
            <Tabs.Screen
                name="index"
                options={{ title: "Home" }}
            />
            <Tabs.Screen
                name="order"
                options={{ title: "Đơn hàng" }}
            />
            <Tabs.Screen
                name="favourite"
                options={{ title: "Đã thích" }}
            />
            <Tabs.Screen
                name="notification"
                options={{ title: "Thông báo" }}
            />
            <Tabs.Screen
                name="account"
                options={{ title: "Tài khoản" }}
            />
        </Tabs>
    );
};

export default TabsLayout;
