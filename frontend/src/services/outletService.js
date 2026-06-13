import API from "../config/api";
import { withPolling } from "./pollingService";

export const outletService = {
  getAllOutlet: async () => {
    return await API.get("/outlet");
  },
  
  createOutlet: async (data) => {
    return await API.post("/outlet/create", data);
  },

  updateOutlet: async (id, data) => {
    return await API.put(`/outlet/update/${id}`, data);
  },

  deleteOutlet: async (id) => {
    return await API.delete(`/outlet/delete/${id}`);
  },

  getOutletStats: async (id, date) => {
    let url = `/outlet/${id}/stats`;
    if (date) {
      url += `?date=${date}`;
    }
    return await API.get(url);
  },
};

outletService.pollGetAllOutlet = withPolling(outletService.getAllOutlet, 5000);
