// test.ts
import { Timestamp } from "firebase-admin/firestore";
import { addUser, getUserById, getAllUsers, registerUser } from "./services/userService";
import { addJob, getJobById, getAllJobs, filterJobs } from "./services/jobService";
import { User } from "./models/User";
import { Job } from "./models/Job";

async function runTests() {
  try {
    console.log("🚀 Starting Firestore database tests...");

    // ===== USERS =====
    console.log("\n--- USERS ---");

    // 1️⃣ Add a user with auto-ID
    const newUser: User = {
      name: "Alice Example",
      email: "alice@example.com",
      createdAt: Timestamp.now(),
      role: "candidate",
      id: "",
    };
    const addedUser = await addUser(newUser);
    console.log("✅ User added with auto ID:", addedUser);

    // 2️⃣ Register a user with a fixed UID
    const registered = await registerUser("uid123", "bob@example.com", "Bob Tester");
    console.log("✅ User registered with UID:", registered);

    // 3️⃣ Fetch user by ID (the auto-added one)
    const fetchedUser = await getUserById(addedUser.id);
    console.log("✅ User fetched by ID:", fetchedUser);

    // 4️⃣ Fetch all users
    const allUsers = await getAllUsers();
    console.log("✅ All users in DB:", allUsers);

    // ===== JOBS =====
    console.log("\n--- JOBS ---");

    // 5️⃣ Add some jobs
    const job1: Job = {
      title: "Backend Engineer",
      field: "Software Engineering",
      region: "Istanbul",
      company: "NeoTech",
      location: "Istanbul Office",
      description: "Work on server-side apps",
      type: "full-time",
      createdAt: Timestamp.now(),
    };

    const job2: Job = {
      title: "Data Scientist",
      field: "Data Science",
      region: "Ankara",
      company: "DataWorks",
      location: "Ankara HQ",
      description: "Analyze datasets and build models",
      type: "full-time",
      createdAt: Timestamp.now(),
    };

    const addedJob1 = await addJob(job1);
    const addedJob2 = await addJob(job2);

    console.log("✅ Job added:", addedJob1);
    console.log("✅ Job added:", addedJob2);

    // 6️⃣ Get job by ID
    const fetchedJob1 = await getJobById(addedJob1.id!);
    console.log("✅ Job fetched by ID:", fetchedJob1);

    // 7️⃣ Get all jobs
    const allJobs = await getAllJobs();
    console.log("✅ All jobs in DB:", allJobs);

    // 8️⃣ Filter jobs (example: region = Istanbul)
    const filteredJobs = await filterJobs({ region: "Istanbul" });
    console.log("✅ Filtered jobs (region=Istanbul):", filteredJobs);

  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

runTests();