// test.ts
import { addUser, getUserById, getAllUsers, registerUser } from "./services/userService";
import { User } from "./models/User";
import { Timestamp } from "firebase-admin/firestore";

async function runTests() {
  try {
    console.log("🚀 Starting Firestore user tests...");

    // 1️⃣ Add a user with auto-ID
    const newUser: User = {
      name: "Alice Example",
      email: "alice@example.com",
      createdAt: Timestamp.now(),
      
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

  } catch (err) {
    console.error("❌ Test failed:", err);
  }
}

runTests();