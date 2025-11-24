import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStpotDetails = async () => {
  const user = await AsyncStorage.getItem("user");
  return JSON.parse(user || "{}");
};
