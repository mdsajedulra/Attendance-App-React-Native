import { getStpotDetails } from "@/utils/spot";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../utils/api";

export default function Male() {
  const [value, setValue] = useState("");
  const [last, setLast] = useState(null);

  const loadLast = async () => {
    const res = await api.get("/attendance/get-last-male");
    setLast(res.data?.data || null);
  };

  const handleSubmit = async () => {
    const spot = await getStpotDetails();
    try {
      const res = await api.post("/attendance/create-male", {
        male: parseInt(value || "0"),
        spotId: spot?.data?._id,
      });
      Alert.alert("Success", res.data.message);
      setValue("");
      loadLast();
    } catch (error) {
      const msg =
        (error as any)?.response?.data?.message ||
        (error as any)?.message ||
        "Unknown error";
      Alert.alert("error", String(msg));
    }
  };

  useEffect(() => {
    loadLast();
  }, []);

  return (
    <View className="flex-1 p-5 bg-slate-100">
      <Text className="text-xl font-bold mb-3">Male Attendance</Text>

      {last && (
        <View className="bg-white p-3 mb-4 rounded shadow">
          <Text className="font-semibold">Last Entry: {last?.male}</Text>
        </View>
      )}

      <TextInput
        placeholder="Enter male count"
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        className="bg-white p-3 rounded border mb-4"
      />

      <TouchableOpacity
        className="bg-blue-600 p-3 rounded"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center text-lg">Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
