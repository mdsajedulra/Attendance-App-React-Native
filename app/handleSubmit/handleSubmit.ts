import api from "@/utils/api";
import { getStpotDetails } from "@/utils/spot";
import { Alert } from "react-native";


export const handleSubmit = async (name, value, endpoint) => {
  const spot = await getStpotDetails();
  console.log(spot.data._id);
  try {
    const res = await api.post(endpoint || "/attendance/create-female", {
      [name]: parseInt(value || "0"),
      spotId: spot?.data?._id,
    });
    Alert.alert("Success", res.data.message);
    
    // loadLast();
  } catch (error) {
    Alert.alert("error", error?.response?.data.message);
  }
};
