import api from "@/utils/api";

export const loadLast = async (
  endPoint: string,
  setFunc: (data: any) => void
) => {
  const res = await api.get(endPoint);
  return setFunc(res.data?.data || null);
};
