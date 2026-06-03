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
};

outletService.pollGetAllOutlet = withPolling(outletService.getAllOutlet, 5000);
