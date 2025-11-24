import { getStpotDetails } from "@/utils/spot";
import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../utils/api";

export default function Female() {
  const [value, setValue] = useState("");
  const [last, setLast] = useState(null);
  //   console.log(last);

  const loadLast = async () => {
    const res = await api.get("/attendance/get-last-female");
    setLast(res.data?.data || null);
  };

  const handleSubmit = async () => {
    const spot = await getStpotDetails();
    console.log(spot.data._id);
    try {
      const res = await api.post("/attendance/create-female", {
        female: parseInt(value || "0"),
        spotId: spot?.data?._id,
      });
      Alert.alert("Success", res.data.message);
      setValue("");
      loadLast();
    } catch (error) {
      Alert.alert("error", error?.response?.data.message);
    }
  };

  useEffect(() => {
    loadLast();
  }, []);

  return (
    <View className="flex-1 p-5 bg-slate-100">
      <Text className="text-xl font-bold mb-3">Female Attendance</Text>

      {last && (
        <View className="bg-white p-3 mb-4 rounded shadow">
          <Text className="font-semibold">Last Entry: {last?.female}</Text>
        </View>
      )}

      <TextInput
        placeholder="Enter female count"
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        className="bg-white p-3 rounded border mb-4"
      />

      <TouchableOpacity
        className="bg-pink-600 p-3 rounded"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center text-lg">Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
