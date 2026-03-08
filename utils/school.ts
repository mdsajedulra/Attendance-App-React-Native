import AsyncStorage from "@react-native-async-storage/async-storage";

export const getSchoolDetails = async () => {
  const user = await AsyncStorage.getItem("user");
  return JSON.parse(user || "{}");
};
