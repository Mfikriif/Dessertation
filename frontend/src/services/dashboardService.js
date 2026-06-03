import API from "../config/api";
import { withPolling } from "./pollingService";

const getDashboardInfo = async () => {
  return await API.get("/dashboard/info");
};

const getPerformaBulanIni = async () => {
  return await API.get("/dashboard/performa-bulan-ini");
};

export const dashboardService = {
  getDashboardInfo,
  getPerformaBulanIni,
  // Menambahkan metode polling dengan interval 5 detik
  pollDashboardInfo: withPolling(getDashboardInfo, 5000),
  pollPerformaBulanIni: withPolling(getPerformaBulanIni, 5000),
};
