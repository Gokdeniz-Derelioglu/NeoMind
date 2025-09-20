import { getAllJobs } from "../services/jobService";

export const fetchJobOpenings = async () => {
  try {
    const jobs = await getAllJobs();
    return jobs;
  } catch (error) {
    console.error("Error fetching job openings:", error);
    return [];
  }
};
