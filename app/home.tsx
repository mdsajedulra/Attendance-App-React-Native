import api from "@/utils/api";
import { formatBanglaDate } from "@/utils/formatBanglaDate";
import { getStpotDetails } from "@/utils/spot";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
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

// Type Definitions (আগের মতোই)
type TAttendance = {
  _id: string;
  spotId: string;
  male?: number;
  female?: number;
  child?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface IAttendance {
  lastMale: TAttendance;
  lastFemale: TAttendance;
  lastChild: TAttendance;
}

export default function Home() {
  const router = useRouter();

  // State Management
  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [lastItem, setLastItem] = useState<IAttendance | null>(null);

  // Separate Loading States for each button (প্রতিটি বাটনের জন্য আলাদা লোডিং স্টেট)
  const [loadingMale, setLoadingMale] = useState(false);
  const [loadingFemale, setLoadingFemale] = useState(false);
  const [loadingChild, setLoadingChild] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);

  // Input States
  const [femaleValue, setFemaleValue] = useState("");
  const [maleValue, setMaleValue] = useState("");
  const [childValue, setChildValue] = useState("");
  const [commentValue, setCommentValue] = useState("");

  // Combined loading state for disabling other actions
  const isGlobalLoading =
    loadingMale || loadingFemale || loadingChild || loadingComment;

  // বাটনের ডিসেবল লজিক (Global Loading এবং Local Input Validity চেক করা হয়েছে)
  const isMaleButtonDisabled =
    isGlobalLoading || maleValue.trim() === "" || parseInt(maleValue) === 0;
  const isFemaleButtonDisabled =
    isGlobalLoading || femaleValue.trim() === "" || parseInt(femaleValue) === 0;
  const isChildButtonDisabled =
    isGlobalLoading || childValue.trim() === "" || parseInt(childValue) === 0;
  const isCommentButtonDisabled = isGlobalLoading || commentValue.trim() === "";

  const loadLast = async () => {
    try {
      const spot = await getStpotDetails();
      if (spot?.data?._id) {
        const res = await api.get(
          `/attendance/get-all-last-attendance?spotId=${spot.data._id}`
        );
        if (res?.data?.data && res.data.data.length > 0) {
          setLastItem(res.data.data[0]);
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
      setMaleValue("");
      setFemaleValue("");
      setChildValue("");
      setCommentValue("");
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLast().finally(() => setRefreshing(false));
  };

  // সাবমিট লজিক (Male/Female/Child এর জন্য)
  // নতুন: setLoading প্যারামিটার যোগ করা হয়েছে
  const handleSubmit = async (
    name: string,
    value: string,
    endpoint: string,
    setLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    if (value.trim() === "" || parseInt(value) === 0) {
      Alert.alert("সতর্কতা", "দয়া করে ০-এর বেশি সংখ্যা লিখুন");
      return;
    }

    setLoading(true); // নির্দিষ্ট বাটন লোডিং শুরু
    const spot = await getStpotDetails();
    try {
      await api.post(endpoint, {
        [name]: parseInt(value || "0"),
        spotId: spot?.data?._id,
      });

      Alert.alert("সফল", "তথ্য সফলভাবে আপডেট করা হয়েছে");

      if (name === "male") setMaleValue("");
      if (name === "female") setFemaleValue("");
      if (name === "child") setChildValue("");

      loadLast();
    } catch (error: any) {
      Alert.alert(
        "ত্রুটি",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false); // নির্দিষ্ট বাটন লোডিং শেষ
    }
  };

  // কমেন্ট সাবমিট লজিক (নতুন)
  const handleCommentSubmit = async () => {
    if (isCommentButtonDisabled) return;

    setLoadingComment(true); // কমেন্ট বাটন লোডিং শুরু
    const spot = await getStpotDetails();

    try {
      const payload = {
        spotId: spot?.data?._id,
        comment: commentValue.trim(),
      };

      await api.post("/attendance/create-comment", payload);

      Alert.alert("সফল", "আপনার মন্তব্য সফলভাবে পাঠানো হয়েছে");
      setCommentValue(""); // কমেন্ট সাবমিট করার পর ক্লিয়ার হবে
    } catch (error: any) {
      Alert.alert(
        "ত্রুটি",
        error?.response?.data?.message || "কমেন্ট পাঠাতে সমস্যা হয়েছে"
      );
    } finally {
      setLoadingComment(false); // কমেন্ট বাটন লোডিং শেষ
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
          {/* Header Section (আগের মতোই) */}
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

          {/* Body Container */}
          <View className="px-5 -mt-10 pb-20">
            {/* MALE CARD */}
            <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="bg-blue-50 p-2 rounded-lg">
                    <FontAwesome5 name="male" size={24} color="#2563EB" />
                  </View>
                  <Text className="text-xl font-bold text-gray-800">পুরুষ</Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${
                    lastItem?.lastMale ? "bg-blue-50" : "bg-red-50"
                  }`}
                >
                  {lastItem?.lastMale ? (
                    <Text className="text-blue-600 text-xs font-medium">
                      {formatBanglaDate(lastItem.lastMale.createdAt)} -{" "}
                      {lastItem.lastMale.male} জন
                    </Text>
                  ) : (
                    <Text className="text-red-500 text-xs font-medium">
                      এন্ট্রি নেই
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  placeholder="সংখ্যা লিখুন"
                  value={maleValue}
                  onChangeText={setMaleValue}
                  keyboardType="numeric"
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl px-4 py-3"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  disabled={isMaleButtonDisabled}
                  // UPDATED: Always use the active style (bg-blue-600)
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-blue-600 active:bg-blue-700"
                  onPress={() =>
                    handleSubmit(
                      "male",
                      maleValue,
                      "/attendance/create-male",
                      setLoadingMale
                    )
                  }
                >
                  <Text className="text-white font-bold text-base">
                    {/* নির্দিষ্ট লোডিং স্টেট চেক করা হয়েছে */}
                    {loadingMale ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      "আপডেট"
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* FEMALE CARD */}
            <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="bg-purple-50 p-2 rounded-lg">
                    <FontAwesome5 name="female" size={24} color="#9333EA" />
                  </View>
                  <Text className="text-xl font-bold text-gray-800">নারী</Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${
                    lastItem?.lastFemale ? "bg-purple-50" : "bg-red-50"
                  }`}
                >
                  {lastItem?.lastFemale ? (
                    <Text className="text-purple-600 text-xs font-medium">
                      {formatBanglaDate(lastItem.lastFemale.createdAt)} -{" "}
                      {lastItem.lastFemale.female} জন
                    </Text>
                  ) : (
                    <Text className="text-red-500 text-xs font-medium">
                      এন্ট্রি নেই
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  placeholder="সংখ্যা লিখুন"
                  value={femaleValue}
                  onChangeText={setFemaleValue}
                  keyboardType="numeric"
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl px-4 py-3"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  disabled={isFemaleButtonDisabled}
                  // UPDATED: Always use the active style (bg-purple-600)
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-purple-600 active:bg-purple-700"
                  onPress={() =>
                    handleSubmit(
                      "female",
                      femaleValue,
                      "/attendance/create-female",
                      setLoadingFemale
                    )
                  }
                >
                  <Text className="text-white font-bold text-base">
                    {/* নির্দিষ্ট লোডিং স্টেট চেক করা হয়েছে */}
                    {loadingFemale ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      "আপডেট"
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* CHILD CARD */}
            <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                  <View className="bg-green-50 p-2 rounded-lg">
                    <FontAwesome5 name="child" size={22} color="#16A34A" />
                  </View>
                  <Text className="text-xl font-bold text-gray-800">শিশু</Text>
                </View>

                <View
                  className={`px-3 py-1 rounded-full ${
                    lastItem?.lastChild ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  {lastItem?.lastChild ? (
                    <Text className="text-green-600 text-xs font-medium">
                      {formatBanglaDate(lastItem.lastChild.createdAt)} -{" "}
                      {lastItem.lastChild.child} জন
                    </Text>
                  ) : (
                    <Text className="text-red-500 text-xs font-medium">
                      এন্ট্রি নেই
                    </Text>
                  )}
                </View>
              </View>

              <View className="flex-row gap-3">
                <TextInput
                  placeholder="সংখ্যা লিখুন"
                  value={childValue}
                  onChangeText={setChildValue}
                  keyboardType="numeric"
                  className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 text-base rounded-xl px-4 py-3"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  disabled={isChildButtonDisabled}
                  // UPDATED: Always use the active style (bg-green-600)
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-green-600 active:bg-green-700"
                  onPress={() =>
                    handleSubmit(
                      "child",
                      childValue,
                      "/attendance/create-child",
                      setLoadingChild
                    )
                  }
                >
                  <Text className="text-white font-bold text-base">
                    {/* নির্দিষ্ট লোডিং স্টেট চেক করা হয়েছে */}
                    {loadingChild ? (
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
                  multiline={true} // মাল্টিলাইন কমেন্টের জন্য
                />
                <TouchableOpacity
                  disabled={isCommentButtonDisabled}
                  // UPDATED: Always use the active style (bg-slate-800)
                  className="justify-center items-center rounded-xl px-6 shadow-sm bg-slate-800 active:bg-slate-900"
                  onPress={handleCommentSubmit} // 🚨 API হিট করার ফাংশন
                >
                  {/* নির্দিষ্ট লোডিং স্টেট চেক করা হয়েছে */}
                  {loadingComment ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <MaterialIcons name="send" size={22} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer Contact Buttons */}
            <View className="flex items-center justify-center pb-10">
              <ContactButtons />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
