// app/home.tsx
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
  Modal,
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

type TDistItem = {
  food: string;
  sent: number;
  received: number;
};

type TDistribution = {
  _id: string;
  uuid: string;
  date: string;
  days: number;
  status: "draft" | "submitted" | "confirmed" | "flagged";
  items: TDistItem[];
};

export default function Home() {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Distribution states
  const [distribution, setDistribution] = useState<TDistribution | null>(null);
  const [confirmingDist, setConfirmingDist] = useState(false);

  // Chalan Modal States
  const [showChalanModal, setShowChalanModal] = useState(false);
  const [chalanNumber, setChalanNumber] = useState("");
  const [selectedDistId, setSelectedDistId] = useState<string | null>(null);

  const [loadingComment, setLoadingComment] = useState(false);
  const [commentValue, setCommentValue] = useState("");

  const isGlobalLoading = loadingComment || confirmingDist;
  const isCommentButtonDisabled = isGlobalLoading || commentValue.trim() === "";

  const loadLast = async () => {
    try {
      const school = await getSchoolDetails();
      const schoolId = school?._id || school?.data?._id;

      if (schoolId) {
        // ডিস্ট্রিবিউশন ডাটা লোড
        const distRes = await api.get(`/distribution/school/${schoolId}`);
        if (distRes?.data?.data) {
          setDistribution(distRes.data.data);
        } else {
          setDistribution(null);
        }
      }
    } catch (error) {
      console.log("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoadingData(true);
      loadLast();
      setCommentValue("");
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadLast().finally(() => setRefreshing(false));
  };

  // ১. বাটন ক্লিক করলে মোডাল ওপেন হবে
  const handleOpenConfirmModal = (distId: string) => {
    setSelectedDistId(distId);
    setShowChalanModal(true);
  };

  // ২. চালান নম্বরসহ কনফার্ম করার আসল ফাংশন
  const handleConfirmWithChalan = async () => {
    if (!chalanNumber.trim()) {
      Alert.alert("সতর্কতা", "দয়া করে চালান নম্বরটি লিখুন");
      return;
    }

    const school = await getSchoolDetails();
    const schoolId = school?._id || school?.data?._id;

    if (!schoolId || !selectedDistId) {
      Alert.alert("ত্রুটি", "প্রয়োজনীয় তথ্য পাওয়া যায়নি");
      return;
    }

    setConfirmingDist(true);
    try {
      // PATCH রিকোয়েস্ট: স্ট্যাটাস এবং চালান নম্বর পাঠানো হচ্ছে
      await api.patch(`/distribution/${selectedDistId}`, {
        status: "confirmed",
        submittedBy: schoolId,
        challan: chalanNumber.trim(),
      });

      Alert.alert("সফল", "চালান নম্বরসহ মালামাল প্রাপ্তি নিশ্চিত করা হয়েছে");
      setShowChalanModal(false);
      setChalanNumber("");
      loadLast(); // ডাটা রিফ্রেশ করা
    } catch (error: any) {
      Alert.alert(
        "ত্রুটি",
        error?.response?.data?.message || "আপডেট করা সম্ভব হয়নি"
      );
    } finally {
      setConfirmingDist(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (isCommentButtonDisabled) return;
    setLoadingComment(true);
    const school = await getSchoolDetails();
    const schoolId = school?._id || school?.data?._id;
    try {
      await api.post("/attendance/create-comment", {
        schoolId: schoolId,
        comment: commentValue.trim(),
      });
      Alert.alert("সফল", "আপনার মন্তব্য সফলভাবে পাঠানো হয়েছে");
      setCommentValue("");
    } catch (error: any) {
      Alert.alert("ত্রুটি", error?.response?.data?.message || "কমেন্ট পাঠাতে সমস্যা হয়েছে");
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
              <Text className="text-white text-lg font-medium opacity-80">ড্যাশবোর্ড</Text>
              <Ionicons name="grid-outline" size={24} color="white" />
            </View>
            <Text className="text-white text-4xl font-bold">স্বাগতম</Text>
            <Text className="text-blue-100 text-sm mt-1">আজকের তথ্য আপডেট করুন</Text>
          </View>

          <View className="px-5 -mt-10 pb-20">
            
            {/* DISTRIBUTION CARD */}
            {distribution && (
              <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-blue-100">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons name="truck-delivery" size={24} color="#2563EB" />
                    <Text className="text-lg font-bold text-gray-800">সর্বশেষ বরাদ্দ</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${distribution.status === 'confirmed' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-xs font-bold ${distribution.status === 'confirmed' ? 'text-green-700' : 'text-orange-700'}`}>
                      {distribution.status === 'confirmed' ? 'গৃহীত' : 'প্রেরিত'}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-500 text-sm mb-4">
                  তারিখ: {formatBanglaDate(distribution.date)} ({distribution.days} দিনের বরাদ্দ)
                </Text>

                <View className="bg-gray-50 rounded-xl p-3 mb-4">
                  {distribution.items.map((item, index) => (
                    <View key={index} className="flex-row justify-between py-1 border-b border-gray-100 last:border-0">
                      <Text className="text-gray-700 font-medium">{item.food}</Text>
                      <Text className="text-blue-600 font-bold">{item.sent} টি</Text>
                    </View>
                  ))}
                </View>

                {distribution.status !== 'confirmed' ? (
                  <TouchableOpacity
                    onPress={() => handleOpenConfirmModal(distribution._id)}
                    disabled={confirmingDist}
                    className="bg-blue-600 py-3 rounded-xl flex-row justify-center items-center"
                  >
                    <Ionicons name="checkmark-done-circle" size={20} color="white" />
                    <Text className="text-white font-bold ml-2">বুঝিয়া পাইলাম</Text>
                  </TouchableOpacity>
                ) : (
                  <View className="bg-green-50 py-3 rounded-xl flex-row justify-center items-center border border-green-200">
                    <Ionicons name="checkmark-circle" size={20} color="#15803D" />
                    <Text className="text-green-700 font-bold ml-2">সফলভাবে গ্রহণ করা হয়েছে</Text>
                  </View>
                )}
              </View>
            )}

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

      {/* CHALAN NUMBER INPUT MODAL */}
      <Modal
        visible={showChalanModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowChalanModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View className="bg-white w-full p-6 rounded-[30px] shadow-2xl">
            <View className="items-center mb-4">
              <View className="bg-blue-100 p-4 rounded-full mb-3">
                <MaterialCommunityIcons name="file-document-edit" size={32} color="#2563EB" />
              </View>
              <Text className="text-xl font-bold text-gray-800">চালান নম্বর লিখুন</Text>
              <Text className="text-gray-500 text-center mt-1">মালামাল সঠিক বুঝে পেলে চালান নম্বরটি দিয়ে নিশ্চিত করুন।</Text>
            </View>

            <TextInput
              placeholder="চালান নম্বর দিন (উদাঃ ১০০১)"
              value={chalanNumber}
              onChangeText={setChalanNumber}
              keyboardType="default"
              className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-4 text-gray-800 text-center text-lg mb-6"
              autoFocus={true}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => { setShowChalanModal(false); setChalanNumber(""); }}
                className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
              >
                <Text className="text-gray-600 font-bold">বাতিল</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleConfirmWithChalan}
                disabled={confirmingDist}
                className="flex-1 bg-blue-600 py-4 rounded-2xl items-center"
              >
                {confirmingDist ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">নিশ্চিত করুন</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}