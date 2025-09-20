import React, { createContext, useContext, useState } from "react";

const JobContext = createContext();

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error("useJobContext must be used within a JobProvider");
  }
  return context;
};

export const JobProvider = ({ children }) => {
  const [appliedJobs, setAppliedJobs] = useState([]);

  const addAppliedJob = (job) => {
    const appliedJob = {
      ...job,
      appliedDate: new Date().toLocaleDateString(),
      status: "pending" // pending, accepted, rejected
    };
    setAppliedJobs(prev => [...prev, appliedJob]);
  };

  const removeAppliedJob = (index) => {
    setAppliedJobs(prev => prev.filter((_, i) => i !== index));
  };

  const updateJobStatus = (index, status) => {
    setAppliedJobs(prev => 
      prev.map((job, i) => 
        i === index ? { ...job, status } : job
      )
    );
  };

  const value = {
    appliedJobs,
    addAppliedJob,
    removeAppliedJob,
    updateJobStatus
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
