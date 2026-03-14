import api from "@/utils/api";
import { getSchoolDetails } from "@/utils/school";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";

type IContactInfo = {
  _id: string;
  email: string;
  message: string;
  phoneNumber: string;
  updatedAt: string;
  waNumber: string;
  __v: string;
};

export default function ContactButtons() {
  const [contactInfo, setContactInfo] = useState<IContactInfo>({
    __v: "",
    _id: "",
    email: "",
    message: "",
    phoneNumber: "",
    updatedAt: "",
    waNumber: "",
  });

  const getContactInfo = async () => {
    const getContactDetails = await api.get("/contactinfo");
    setContactInfo(getContactDetails.data?.data);
  };

  useEffect(() => {
    getContactInfo();
  }, []);

  const [school, setschool] = useState<any>(null);

  useEffect(() => {
    const fetchschoolDetails = async () => {
      const schoolData = await getSchoolDetails();
      setschool(schoolData);
    };
    fetchschoolDetails();
  }, []);

  const { phoneNumber, waNumber, message } = contactInfo;

  const whatsappMessage = `${school?.schoolName || "N/A"}, আমার কোড ${
    school?.schoolCode || "N/A"
  } ${message}`;

  const makeCall = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  const openWhatsApp = () => {
    Linking.openURL(
      `whatsapp://send?phone=${"+88" + waNumber}&text=${encodeURIComponent(
        whatsappMessage,
      )}`,
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
