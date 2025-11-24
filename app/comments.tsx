import { getStpotDetails } from "@/utils/spot";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import api from "../utils/api";

export default function Comments() {
  const [note, setNote] = useState("");

  const handleSubmit = async () => {
    const spot = await getStpotDetails();
    console.log(spot.data._id);
    try {
      const res = await api.post("/attendance/create-comment", {
        comment: note,
        spotId: spot.data._id,
      });
      Alert.alert(res.data.message || "Successfully submitted!");
      console.log(res.data.message);
      setNote("");
    } catch (error) {
      console.log(error);
      Alert.alert("error", "error")
    }
  };

  return (
    <View className="flex-1 p-5 bg-slate-100">
      <Text className="text-xl font-bold mb-3">Add Comment</Text>

      <TextInput
        placeholder="Write comment..."
        value={note}
        onChangeText={setNote}
        className="bg-white p-3 rounded border mb-4"
      />

      <TouchableOpacity
        className="bg-gray-800 p-3 rounded"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center text-lg">Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
