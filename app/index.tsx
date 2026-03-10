// app/index.tsx
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import api from "../utils/api";
import "./globals.css";

export default function Login() {
  const router = useRouter();
  const [schoolCode, setschoolCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!schoolCode || !password) {
      Alert.alert("ত্রুটি", "দয়া করে স্কুল কোড এবং পাসওয়ার্ড দিন");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/school/school-login", {
        schoolCode,
        password,
      });

      const responseData = res.data;

      // আপনার রেসপন্স অনুযায়ী success true হলে ভেতরে ঢুকবে
      if (responseData.success === true) {
        // ১. রেসপন্সে আলাদা টোকেন না থাকায় '_id' কেই টোকেন হিসেবে সেভ করছি
        const loginToken = responseData.data._id;

        await AsyncStorage.setItem("token", loginToken);
        await AsyncStorage.setItem("user", JSON.stringify(responseData.data));

        // ২. সরাসরি হোমে পাঠিয়ে দেওয়া
        router.replace("/home");
      } else {
        Alert.alert("লগিন ব্যর্থ", "ভুল স্কুল কোড অথবা পাসওয়ার্ড");
      }
    } catch (err: any) {
      Alert.alert(
        "লগিন ত্রুটি",
        err?.response?.data?.message ||
          "সার্ভারে সমস্যা হচ্ছে, পরে আবার চেষ্টা করুন।",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-blue-600">
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      {/* উপরের অংশ */}
      <View className="flex-[0.4] justify-center items-center">
        <View className="bg-white/20 p-6 rounded-full mb-4">
          <FontAwesome5 name="user-shield" size={50} color="white" />
        </View>
        <Text className="text-white text-3xl font-bold">স্বাগতম</Text>
        <Text className="text-blue-100 text-sm mt-1">
          আপনার অ্যাকাউন্টে লগিন করুন
        </Text>
      </View>

      {/* নিচের সাদা কার্ড */}
      <View className="flex-1 bg-gray-50 rounded-t-[40px] px-8 pt-10 shadow-2xl">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="space-y-6">
            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
                স্কুল কোড
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <FontAwesome5 name="hashtag" size={18} color="#6B7280" />
                <TextInput
                  placeholder="আপনার স্কুল কোড দিন"
                  value={schoolCode}
                  onChangeText={setschoolCode}
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-semibold mb-2 ml-1">
                পাসওয়ার্ড
              </Text>
              <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#6B7280"
                />
                <TextInput
                  placeholder="আপনার গোপন পাসওয়ার্ড"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-gray-800 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`py-4 rounded-xl shadow-md mt-4 flex-row justify-center items-center ${
                loading ? "bg-blue-400" : "bg-blue-600 active:bg-blue-700"
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-lg">
                  লগিন করুন
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}
