import { getStpotDetails } from "@/utils/spot";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";

export default function ContactButtons() {
  const [spot, setSpot] = useState<any>(null);
  useEffect(() => {
    const fetchSpotDetails = async () => {
      const spotData = await getStpotDetails();
      setSpot(spotData);
    };
    fetchSpotDetails();
  }, []);

  const phoneNumber = "01780941957";

  const whatsappMessage = `${spot?.data?.spotName || "N/A"}, আমার কোড ${
    spot?.data?.spotCode || "N/A"
  } আমি আপনার সাথে কথা বলতে চাই`;

  const makeCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  const openWhatsApp = () => {
    Linking.openURL(
      `whatsapp://send?phone=${"+88" + phoneNumber}&text=${encodeURIComponent(
        whatsappMessage
      )}`
    ).catch(() => {
      Alert.alert("দুঃখিত", "আপনার ফোনে হোয়াটসঅ্যাপ ইনস্টল করা নেই।");
    });
  };

  return (
    <View className="w-full px-4 mt-4 mb-10">
      <View className="flex-row items-center justify-between">
        {/* Call Button */}
        <TouchableOpacity
          onPress={makeCall}
          className="flex-1 flex-row items-center justify-center bg-blue-600 py-4 px-2 rounded-xl mr-3 shadow-md"
          style={{ elevation: 3 }}
        >
          <Ionicons name="call" size={20} color="white" />
          <Text className="text-white font-bold text-lg ml-3">কল করুন</Text>
        </TouchableOpacity>

        {/* WhatsApp Button */}
        <TouchableOpacity
          onPress={openWhatsApp}
          className="flex-1 flex-row items-center justify-center bg-[#25D366] py-4 px-2 rounded-xl ml-3 shadow-md"
          style={{ elevation: 3 }}
        >
          <FontAwesome name="whatsapp" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-3">মেসেজ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
