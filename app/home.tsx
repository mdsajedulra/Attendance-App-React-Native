import api from "@/utils/api";
import { formatBanglaDate } from "@/utils/formatBanglaDate";

import { getSchoolDetails } from "@/utils/school";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import ContactButtons from "./call/call";

// Type Definitions
type TAE = {
  count: number;
  submittedAt: Date;
};
type TAttendance = {
  banruti?: TAE;
  banana?: TAE;
  egg?: TAE;
};

export default function Home() {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [lastItem, setLastItem] = useState<TAttendance | null>(null);

  console.log("test", lastItem);

  const [loadingbanruti, setLoadingbanruti] = useState(false);
  const [loadingbanana, setLoadingBanana] = useState(false);
  const [loadingEgg, setLoadingEgg] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  const [bananaValue, setbananaValue] = useState("");
  const [banrutiValue, setbanrutiValue] = useState("");
  const [childValue, setEggValue] = useState("");
  const [commentValue, setCommentValue] = useState("");

  const isGlobalLoading =
    loadingbanruti || loadingbanana || loadingEgg || loadingComment;

  const isbanrutiButtonDisabled =
    isGlobalLoading ||
    banrutiValue.trim() === "" ||
    parseInt(banrutiValue) === 0;
  const isbananaButtonDisabled =
    isGlobalLoading || bananaValue.trim() === "" || parseInt(bananaValue) === 0;
  const isEggButtonDisabled =
    isGlobalLoading || childValue.trim() === "" || parseInt(childValue) === 0;
  const isCommentButtonDisabled = isGlobalLoading || commentValue.trim() === "";

  const loadLast = async () => {
    try {
      const school = await getSchoolDetails();
      if (school?.data?._id) {
        const res = await api.get(
          `/attendance/get-last?schoolId=${school.data._id}`,
        );
        console.log(res?.data?.data);
        if (res?.data?.data) {
          setLastItem(res?.data?.data);
        } else {
          setLastItem(null);
        }
      }
    } catch (error) {
      console.log("Error loading data", error);
    } finally {
      setLoadingData(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoadingData(true);
      loadLast();
      setbanrutiValue("");
      setbananaValue("");
      setEggValue("");
      setCommentValue("");
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLast().finally(() => setRefreshing(false));
  };

  const handleSubmit = async (
    name: string,
    value: string,
    endpoint: string,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    if (value.trim() === "" || parseInt(value) === 0) {
      Alert.alert("সতর্কতা", "দয়া করে ০-এর বেশি সংখ্যা লিখুন");
      return;
    }
    setLoading(true);
    const school = await getSchoolDetails();
    try {
      await api.post(endpoint, {
        [name]: { count: parseInt(value || "0"), submittedAt: Date() },
        schoolId: school?.data?._id,
      });
      Alert.alert("সফল", "তথ্য সফলভাবে আপডেট করা হয়েছে");
      if (name === "banruti") setbanrutiValue("");
      if (name === "banana") setbananaValue("");
      if (name === "child") setEggValue("");
      loadLast();
    } catch (error: any) {
      Alert.alert(
        "ত্রুটি",
        error?.response?.data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (isCommentButtonDisabled) return;
    setLoadingComment(true);
    const school = await getSchoolDetails();
    try {
      await api.post("/attendance/create-comment", {
        schoolId: school?.data?._id,
        comment: commentValue.trim(),
      });
      Alert.alert("সফল", "আপনার মন্তব্য সফলভাবে পাঠানো হয়েছে");
      setCommentValue("");
    } catch (error: any) {
      Alert.alert(
        "ত্রুটি",
        error?.response?.data?.message || "কমেন্ট পাঠাতে সমস্যা হয়েছে",
      );
    } finally {
      setLoadingComment(false);
    }
  };

  if (loadingData && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-500 mt-2">তথ্য লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563EB"]}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="bg-blue-600 pt-10 pb-16 px-6 rounded-b-[30px] shadow-lg">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-lg font-medium opacity-80">
                ড্যাশবোর্ড
              </Text>
              <Ionicons name="grid-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-4xl font-bold">স্বাগতম</Text>
            <Text className="text-blue-100 text-sm mt-1">
              আজকের তথ্য আপডেট করুন
            </Text>
          </View>

          <View className="px-5 -mt-10 pb-20">
            {/* BONRUTI CARD */}
            <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="bg-blue-50 p-2 rounded-lg">
                    {/* আইকন কালার শুধু পরিবর্তন করা হয়েছে (Brown) */}
                    <MaterialCommunityIcons
                      name="bread-slice"
                      size={24}
                      color="#92400E"
                    />
                  </View>
                  <Text className="text-xl font-bold text-gray-800">
                    বনরুটি
                  </Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${lastItem?.banruti ? "bg-blue-50" : "bg-red-50"}`}
                >
                  <Text
                    className={`${lastItem?.banruti ? "text-blue-600" : "text-red-500"} text-xs font-medium`}
                  >
                    {lastItem?.banruti
                      ? `${formatBanglaDate(
                          lastItem?.banruti?.submittedAt,
                        )} - ${lastItem?.banruti?.count} টি`
                      : "এন্ট্রি নেই"}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  placeholder="সংখ্যা লিখুন"
                  value={banrutiValue}
                  onChangeText={setbanrutiValue}
                  keyboardType="numeric"
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl px-4 py-3"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  disabled={isbanrutiButtonDisabled}
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-blue-600 active:bg-blue-700"
                  onPress={() =>
                    handleSubmit(
                      "banruti",
                      banrutiValue,
                      "/attendance",
                      setLoadingbanruti,
                    )
                  }
                >
                  <Text className="text-white font-bold text-base">
                    {loadingbanruti ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      "আপডেট"
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DIM CARD */}
            <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="bg-purple-50 p-2 rounded-lg">
                    {/* আইকন কালার শুধু পরিবর্তন করা হয়েছে (Orange/Yellow) */}
                    <MaterialCommunityIcons
                      name="egg"
                      size={24}
                      color="#F59E0B"
                    />
                  </View>
                  <Text className="text-xl font-bold text-gray-800">ডিম</Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${lastItem?.egg ? "bg-purple-50" : "bg-red-50"}`}
                >
                  <Text
                    className={`${lastItem?.egg ? "text-purple-600" : "text-red-500"} text-xs font-medium`}
                  >
                    {lastItem?.egg
                      ? `${formatBanglaDate(lastItem?.egg?.submittedAt)} - ${lastItem?.egg?.count} টি`
                      : "এন্ট্রি নেই"}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  placeholder="সংখ্যা লিখুন"
                  value={bananaValue}
                  onChangeText={setbananaValue}
                  keyboardType="numeric"
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl px-4 py-3"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  disabled={isbananaButtonDisabled}
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-purple-600 active:bg-purple-700"
                  onPress={() =>
                    handleSubmit(
                      "egg",
                      bananaValue,
                      "/attendance",
                      setLoadingEgg,
                    )
                  }
                >
                  <Text className="text-white font-bold text-base">
                    {loadingEgg ? <ActivityIndicator color="white" /> : "আপডেট"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* KOLA CARD */}
            <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="bg-green-50 p-2 rounded-lg">
                    {/* আইকন কালার শুধু পরিবর্তন করা হয়েছে (Yellow) */}
                    <Text style={{ fontSize: 24 }}>🍌</Text>
                  </View>
                  <Text className="text-xl font-bold text-gray-800">কলা</Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${lastItem?.banana ? "bg-green-50" : "bg-red-50"}`}
                >
                  <Text
                    className={`${lastItem?.banana ? "text-green-600" : "text-red-500"} text-xs font-medium`}
                  >
                    {lastItem?.banana
                      ? `${formatBanglaDate(lastItem?.banana?.submittedAt as Date | string)} - ${lastItem?.banana?.count} টি`
                      : "এন্ট্রি নেই"}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  placeholder="সংখ্যা লিখুন"
                  value={childValue}
                  onChangeText={setbananaValue}
                  keyboardType="numeric"
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl px-4 py-3"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  disabled={isbananaButtonDisabled}
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-green-600 active:bg-green-700"
                  onPress={() =>
                    handleSubmit(
                      "banana",
                      childValue,
                      "/attendance",
                      setLoadingBanana,
                    )
                  }
                >
                  <Text className="text-white font-bold text-base">
                    {loadingbanana ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      "আপডেট"
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* COMMENT SECTION */}
            <View className="bg-white p-5 rounded-2xl shadow-sm mb-6 border border-gray-100">
              <Text className="text-gray-700 font-semibold mb-3 ml-1">
                আপনি কি কিছু জানাতে চান?
              </Text>
              <View className="flex-row gap-3">
                <TextInput
                  placeholder="আপনার বার্তা লিখুন..."
                  value={commentValue}
                  onChangeText={setCommentValue}
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl px-4 py-3"
                  placeholderTextColor="#9CA3AF"
                  multiline={true}
                />
                <TouchableOpacity
                  disabled={isCommentButtonDisabled}
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-slate-800 active:bg-slate-900"
                  onPress={handleCommentSubmit}
                >
                  {loadingComment ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <MaterialIcons name="send" size={22} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex items-center justify-center pb-10">
              <ContactButtons />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
