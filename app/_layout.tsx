// app/_layout.tsx
import { getSchoolDetails } from "@/utils/school";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter, useSegments } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomDrawerContent(props: any) {
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [school, setschool] = useState<any>(null);

  useEffect(() => {
    const fetchschoolDetails = async () => {
      const schoolData = await getSchoolDetails();
      setschool(schoolData);
    };
    fetchschoolDetails();
  }, []);

  const handleLogout = () => {
    Alert.alert("লগআউট", "আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?", [
      { text: "না", style: "cancel" },
      {
        text: "হ্যাঁ",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 20 }}
      >
        <View className="px-5 mb-8 mt-4 border-b border-gray-100 pb-6">
          <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-3">
            <Ionicons name="person" size={30} color="#2563EB" />
          </View>
          <Text className="text-xl font-bold text-gray-800">
            {school?.data?.schoolName || "স্পট ম্যানেজার"}
          </Text>
          <Text className="text-sm font-bold text-gray-800">
            স্কুল কোড: {school?.data?.schoolCode || "----"}
          </Text>
          <Text className="text-sm text-gray-500">ম্যানেজমেন্ট ড্যাশবোর্ড</Text>
        </View>
        <View className="px-2">
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View
        className="p-4 border-t border-gray-100"
        style={{ paddingBottom: 20 + bottom }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-red-50 py-3 rounded-xl border border-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold ml-2">লগআউট</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function Layout() {
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");

      // ইউজার কি বর্তমানে লগিন পেজে (index) আছে?
      const inAuthGroup = segments.length === 0 || segments[0] === "index";

      if (!token && !inAuthGroup) {
        // টোকেন নেই কিন্তু ভেতরে ঢোকার চেষ্টা করছে -> লগিন পেজে পাঠাও
        router.replace("/");
      } else if (token && inAuthGroup) {
        // টোকেন আছে কিন্তু লগিন পেজে বসে আছে -> হোমে পাঠাও
        router.replace("/home");
      }
      setIsReady(true);
    };

    checkAuth();
  }, [segments]); // রুট পরিবর্তন হলেই এই চেকটি হবে

  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor="#2563EB" />
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerStyle: { backgroundColor: "#2563EB" },
          headerTintColor: "white",
          headerTitleStyle: { fontWeight: "bold" },
          drawerActiveBackgroundColor: "#EFF6FF",
          drawerActiveTintColor: "#2563EB",
          drawerInactiveTintColor: "#4B5563",
          drawerLabelStyle: { marginLeft: -5, fontWeight: "600", fontSize: 15 },
          drawerItemStyle: {
            borderRadius: 10,
            paddingVertical: 2,
            marginBottom: 5,
          },
        }}
      >
        <Drawer.Screen
          name="home"
          options={{
            title: "ড্যাশবোর্ড",
            drawerIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={22} color={color} />
            ),
          }}
        />
        {/* বাকি স্ক্রিনগুলো আগের মতোই থাকবে */}
        <Drawer.Screen
          name="male"
          options={{ title: "পুরুষ", drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="female"
          options={{ title: "নারী", drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="child"
          options={{ title: "শিশু", drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="comments"
          options={{ title: "মন্তব্য", drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="lastLoad"
          options={{ title: "lastLoad", drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="call/call"
          options={{ title: "কল", drawerItemStyle: { display: "none" } }}
        />
        <Drawer.Screen
          name="handleSubmit/handleSubmit"
          options={{ title: "সাবমিট", drawerItemStyle: { display: "none" } }}
        />

        <Drawer.Screen
          name="index"
          options={{
            title: "Login",
            drawerItemStyle: { display: "none" },
            headerShown: false,
            swipeEnabled: false,
          }}
        />
      </Drawer>
    </>
  );
}
