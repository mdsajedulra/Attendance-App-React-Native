// app/reports.tsx
import api from "@/utils/api";
import { getSchoolDetails } from "@/utils/school";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Buffer } from "buffer"; // buffer ইনস্টল না থাকলে: npx expo install buffer
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Reports() {
  const [loading, setLoading] = useState(false);
  
  // ডিফল্ট মাস ও বছর
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const months = [
    { id: 1, name: "জানুয়ারি" }, { id: 2, name: "ফেব্রুয়ারি" },
    { id: 3, name: "মার্চ" }, { id: 4, name: "এপ্রিল" },
    { id: 5, name: "মে" }, { id: 6, name: "জুন" },
    { id: 7, name: "জুলাই" }, { id: 8, name: "আগস্ট" },
    { id: 9, name: "সেপ্টেম্বর" }, { id: 10, name: "অক্টোবর" },
    { id: 11, name: "নভেম্বর" }, { id: 12, name: "ডিসেম্বর" },
  ];

  // ম্যানুয়াল বছর তালিকা
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const handleDownload = async () => {
    setLoading(true);
    try {
      const school = await getSchoolDetails();
      const schoolId = school?._id || school?.data?._id;

      if (!schoolId) {
        Alert.alert("ত্রুটি", "স্কুল আইডি পাওয়া যায়নি।");
        return;
      }

      // ১. আপনার api.ts ব্যবহার করে কল করা
      // এখানে responseType: 'arraybuffer' খুবই গুরুত্বপূর্ণ কারণ ফাইল বডিতে আসছে
      const response = await api.get(
        `/distribution/school/report/${schoolId}`,
        {
          params: {
            month: selectedMonth,
            year: selectedYear,
            type: "docx",
          },
          responseType: "arraybuffer", 
        }
      );

      // ২. ফাইল পাথ তৈরি করা
      const fileName = `Report_${selectedMonth}_${selectedYear}.docx`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      // ৩. ডাটাকে Base64 এ কনভার্ট করা (FileSystem এর জন্য প্রয়োজন)
      const base64 = Buffer.from(response.data, "binary").toString("base64");

      // ৪. ডিভাইসে ফাইলটি সেভ করা
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // ৫. সরাসরি ফাইলটি ওপেন বা শেয়ার করা
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert("সফল", "রিপোর্টটি ডাউনলোড হয়েছে।");
      }

    } catch (error: any) {
      console.log("Download Error:", error);
      Alert.alert(
        "ত্রুটি",
        "রিপোর্ট ডাউনলোড করা যায়নি। এই সময়ের কোনো ডাটা নাও থাকতে পারে।"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-slate-800 pt-14 pb-10 px-6 rounded-b-[40px]">
        <Text className="text-white text-2xl font-bold text-center">মাসিক রিপোর্ট</Text>
        <Text className="text-slate-300 text-center mt-2">DOCX ফরম্যাটে ডাউনলোড করুন</Text>
      </View>

      <View className="p-6 -mt-6">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          
          {/* Year selection */}
          <Text className="text-gray-800 font-bold mb-4">বছর নির্বাচন করুন</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                onPress={() => setSelectedYear(year)}
                className={`px-5 py-2.5 rounded-xl border ${
                  selectedYear === year ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-200"
                }`}
              >
                <Text className={`font-bold ${selectedYear === year ? "text-white" : "text-gray-600"}`}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Month selection */}
          <Text className="text-gray-800 font-bold mb-4">মাস নির্বাচন করুন</Text>
          <View className="flex-row flex-wrap justify-between">
            {months.map((month) => (
              <TouchableOpacity
                key={month.id}
                onPress={() => setSelectedMonth(month.id)}
                className={`w-[31%] mb-3 p-3 rounded-xl border items-center ${
                  selectedMonth === month.id ? "bg-blue-50 border-blue-500" : "bg-gray-50 border-gray-100"
                }`}
              >
                <Text className={`font-medium ${selectedMonth === month.id ? "text-blue-700" : "text-gray-600"}`}>
                  {month.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Download Button */}
          <TouchableOpacity
            onPress={handleDownload}
            disabled={loading}
            className={`mt-6 py-4 rounded-2xl flex-row justify-center items-center shadow-lg ${
              loading ? "bg-gray-400" : "bg-blue-600"
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="cloud-download" size={24} color="white" />
                <Text className="text-white font-bold text-lg ml-2">রিপোর্ট ডাউনলোড করুন</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}