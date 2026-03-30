// app/update-info.tsx
import api from "@/utils/api";
import { getSchoolDetails } from "@/utils/school";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function UpdateInfo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Form States
  const [formData, setFormData] = useState({
    tifinManager: "",
    tifinManagerPNumber: "",
    headTeacherName: "",
    headTeacherPhoneNumber: "",
  });

  useEffect(() => {
    const loadCurrentData = async () => {
      try {
        // ১. আগে লোকাল বা স্টোর করা স্কুল ডিটেইলস নিয়ে আসা
        const schoolDetails = await getSchoolDetails();
        
        // যদি লোকাল স্টোরেজে ডাটা থাকে, সেটা সাথে সাথে ফর্মে বসিয়ে দিন
        if (schoolDetails) {
          setFormData({
            tifinManager: schoolDetails.tifinManager || "",
            tifinManagerPNumber: schoolDetails.tifinManagerPNumber || "",
            headTeacherName: schoolDetails.headTeacherName || "",
            headTeacherPhoneNumber: schoolDetails.headTeacherPhoneNumber || "",
          });
        }

        const schoolId = schoolDetails?._id || schoolDetails?.data?._id;

        // ২. এবার সার্ভার থেকে লেটেস্ট ডাটা নিয়ে আসা (যদি কিছু পরিবর্তন হয়ে থাকে)
        if (schoolId) {
          const res = await api.get(`/school/${schoolId}`);
          const data = res.data?.data;

          if (data) {
            setFormData({
              tifinManager: data.tifinManager || "",
              tifinManagerPNumber: data.tifinManagerPNumber || "",
              headTeacherName: data.headTeacherName || "",
              headTeacherPhoneNumber: data.headTeacherPhoneNumber || "",
            });
          }
        }
      } catch (error) {
        console.log("Error loading school info:", error);
      } finally {
        setFetching(false);
      }
    };
    loadCurrentData();
  }, []);

  const handleUpdate = async () => {
    if (
      !formData.tifinManager || 
      !formData.tifinManagerPNumber || 
      !formData.headTeacherName || 
      !formData.headTeacherPhoneNumber
    ) {
      Alert.alert("সতর্কতা", "দয়া করে সবকটি ঘর পূরণ করুন");
      return;
    }

    setLoading(true);
    try {
      const schoolDetails = await getSchoolDetails();
      const schoolId = schoolDetails?._id || schoolDetails?.data?._id;

      await api.patch(`/school/${schoolId}`, formData);

      Alert.alert("সফল", "তথ্য সফলভাবে হালনাগাদ করা হয়েছে");
      router.back();
    } catch (error: any) {
      Alert.alert(
        "ত্রুটি",
        error?.response?.data?.message || "তথ্য আপডেট করা সম্ভব হয়নি"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-2 text-gray-500">তথ্য লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-800">তথ্য হালনাগাদ</Text>
          <Text className="text-gray-500">স্কুলের দায়িত্বপ্রাপ্তদের তথ্য পরিবর্তন করুন</Text>
        </View>

        {/* টিফিন ম্যানেজার সেকশন */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <View className="flex-row items-center mb-4 gap-2">
            <MaterialCommunityIcons name="account-tie" size={24} color="#2563EB" />
            <Text className="text-lg font-semibold text-gray-700">টিফিন ম্যানেজার</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-600 mb-1 ml-1">ম্যানেজারের নাম</Text>
              <TextInput
                value={formData.tifinManager}
                onChangeText={(text) => setFormData({ ...formData, tifinManager: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="নাম লিখুন"
              />
            </View>
            <View>
              <Text className="text-gray-600 mb-1 ml-1">ফোন নম্বর</Text>
              <TextInput
                value={formData.tifinManagerPNumber}
                onChangeText={(text) => setFormData({ ...formData, tifinManagerPNumber: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="০১৮XXXXXXXX"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* প্রধান শিক্ষক সেকশন */}
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-10">
          <View className="flex-row items-center mb-4 gap-2">
            <MaterialCommunityIcons name="school" size={24} color="#2563EB" />
            <Text className="text-lg font-semibold text-gray-700">প্রধান শিক্ষক</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-600 mb-1 ml-1">শিক্ষকের নাম</Text>
              <TextInput
                value={formData.headTeacherName}
                onChangeText={(text) => setFormData({ ...formData, headTeacherName: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="নাম লিখুন"
              />
            </View>
            <View>
              <Text className="text-gray-600 mb-1 ml-1">ফোন নম্বর</Text>
              <TextInput
                value={formData.headTeacherPhoneNumber}
                onChangeText={(text) => setFormData({ ...formData, headTeacherPhoneNumber: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                placeholder="০১৮XXXXXXXX"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleUpdate}
          disabled={loading}
          className={`py-4 rounded-2xl shadow-md mb-20 flex-row justify-center items-center ${
            loading ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">তথ্য জমা দিন</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}