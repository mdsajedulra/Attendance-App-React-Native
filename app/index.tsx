// app/index.tsx
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import api from "../utils/api";
import "./globals.css";

export default function Login() {
  const router = useRouter();
  const [spotCode, setSpotCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ১. অ্যাপ ওপেন হলেই চেক করবে ইউজার লগিন করা আছে কি না
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // টোকেন থাকলে সরাসরি হোম পেজে পাঠিয়ে দেবে
          router.replace("/home");
        }
      } catch (error) {
        console.log("Error checking token", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    if (!spotCode || !password) {
      Alert.alert("ত্রুটি", "দয়া করে স্পট কোড এবং পাসওয়ার্ড দিন");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/spot/spot-login", { spotCode, password });
      const data = res.data;

      const token = data.token || data.accessToken || data?.data?.token;

      if (data.success || data.status === "ok" || token) {
        // ২. লগিন সফল হলে টোকেন সেভ করবে
        if (token) await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("user", JSON.stringify(data));
        
        // ৩. হোম পেজে নিয়ে যাবে (replace ব্যবহার করায় ব্যাকে আসা যাবে না)
        router.replace("/home");
      } else {
        Alert.alert("লগিন ব্যর্থ", "ভুল স্পট কোড অথবা পাসওয়ার্ড");
      }
    } catch (err: any) {
      console.log("Login error:", err?.response?.data || err.message);
      Alert.alert(
        "লগিন ত্রুটি",
        err?.response?.data?.message || "সার্ভারে সমস্যা হচ্ছে, পরে আবার চেষ্টা করুন।"
      );
    } finally {
      setLoading(false);
    }
  };

  // লোডিং অবস্থায় স্পিনার দেখাবে
  if (checkingAuth) {
    return (
      <View className="flex-1 justify-center items-center bg-blue-600">
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-blue-600">
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />
      
      {/* উপরের অংশ - লোগো বা টাইটেল */}
      <View className="flex-[0.4] justify-center items-center">
        <View className="bg-white/20 p-6 rounded-full mb-4">
            <FontAwesome5 name="user-shield" size={50} color="white" />
        </View>
        <Text className="text-white text-3xl font-bold">স্বাগতম</Text>
        <Text className="text-blue-100 text-sm mt-1">আপনার অ্যাকাউন্টে লগিন করুন</Text>
      </View>

      {/* নিচের অংশ - সাদা কার্ড */}
      <View className="flex-1 bg-gray-50 rounded-t-[40px] px-8 pt-10 shadow-2xl">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="space-y-6">
            
            {/* Spot Code Input */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">স্পট কোড</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <FontAwesome5 name="hashtag" size={18} color="#6B7280" />
                <TextInput
                  placeholder="আপনার স্পট কোড দিন"
                  value={spotCode}
                  onChangeText={setSpotCode}
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">পাসওয়ার্ড</Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                <TextInput
                  placeholder="আপনার গোপন পাসওয়ার্ড"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`py-4 rounded-xl shadow-md mt-4 flex-row justify-center items-center ${
                loading ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" className="mr-2" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">লগিন করুন</Text>
              )}
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}