// test.ts
import { addUser, getUserById, getAllUsers, registerUser } from "./services/userService";
import { addJob, getJobs } from "./services/jobService";
import { User } from "./models/User";
import { Job } from "./models/Job";
import { CV } from "./models/CV";
import { addCV, joinCv, updateCV } from "./services/cvService";
import { Timestamp } from "firebase-admin/firestore";

async function runTests() {
  try {
    console.log("🚀 Starting Firestore user tests...");

    // 1️⃣ Add a user with auto-ID
    const newUser: User = {
      name: "Alice Example",
      email: "alice@example.com",
      createdAt: Timestamp.now(),
      role: "candidate",
    };
    const addedUser = await addUser(newUser);
    console.log("✅ User added with auto ID:", addedUser);

    // 2️⃣ Register a user with a fixed UID
    const registered = await registerUser("uid123", "bob@example.com", "Bob Tester");
    console.log("✅ User registered with UID:", registered);

    // 3️⃣ Fetch by ID (the auto-added one)
    const fetchedUser = await getUserById(addedUser.id);
    console.log("✅ User fetched by ID:", fetchedUser);

    // 4️⃣ Fetch all users
    const allUsers = await getAllUsers();
    console.log("✅ All users in DB:", allUsers);

    // ------------------ JOB TESTS ------------------
    console.log("🚀 Starting Firestore job tests...");

    const jobsToAdd: Job[] = [
      {
        company: "TechCorp",
        name: "Frontend Engineer",
        logo: "💻",
        industry: "Software",
        size: "50-100",
        location: "Remote",
        rating: 4,
        founded: 2015,
        position: "Frontend Engineer",
        salary: "$70k-$90k",
        type: "full-time",
        experience: [2, 5],
        skills: ["React", "TypeScript", "CSS"],
        description: "Build amazing web interfaces",
        benefits: ["Health insurance", "Remote work"],
        posted: "2 days ago",
        createdAt: new Date(),
      },
      {
        company: "InnovateX",
        name: "Backend Engineer",
        logo: "🖥️",
        industry: "Software",
        size: "100-200",
        location: "NYC",
        rating: 5,
        founded: 2010,
        position: "Backend Engineer",
        salary: "$80k-$100k",
        type: "full-time",
        experience: [3, 7],
        skills: ["Node.js", "Express", "MongoDB"],
        description: "Design scalable backend systems",
        benefits: ["401k", "Stock options"],
        posted: "5 days ago",
        createdAt: new Date(),
      },
    ];

    for (const job of jobsToAdd) {
      const addedJob = await addJob(job);
      console.log("✅ Job added:", addedJob);
    }

    // Fetch all jobs to verify
    const allJobs = await getJobs();
    console.log("✅ All jobs in DB:", allJobs);

    // ------------------ CV TESTS ------------------
    console.log("🚀 Starting Firestore CV tests...");

    // 1️⃣ Add a CV for the first user
    const newCV: CV = {
      userId: addedUser.id!,
      contents: "Alice's professional CV: experienced frontend developer skilled in React and TypeScript",
      createdAt: Timestamp.now(),
    };

    const addedCV: CV = await addCV(newCV, addedUser as User, addedUser.id!);
    console.log("✅ CV added:", addedCV);

    // 2️⃣ Join the CV to the user
    await joinCv(addedCV.id!, addedUser.id!);
    console.log(`✅ CV ${addedCV.id} joined to user ${addedUser.id}`);

    // 3️⃣ Update the CV
    const updateResult = await updateCV(addedCV.id!, {
      contents: "Updated CV: added more React and TypeScript experience",
    });
    console.log("✅ CV updated:", updateResult);

  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

runTests();