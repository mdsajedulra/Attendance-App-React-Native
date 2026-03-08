import api from "@/utils/api";
import { getSchoolDetails } from "@/utils/school";

import { Alert } from "react-native";

export const handleSubmit = async (name, value, endpoint) => {
  const school = await getSchoolDetails();
  console.log(school.data._id);
  try {
    const res = await api.post(endpoint || "/attendance/create-female", {
      [name]: parseInt(value || "0"),
      schoolId: school?.data?._id,
    });
    Alert.alert("Success", res.data.message);

    // loadLast();
  } catch (error) {
    Alert.alert("error", error?.response?.data.message);
  }
};
