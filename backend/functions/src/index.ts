import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// ✅ Get all jobs
export const getJobs = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("jobs").get();
    const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(jobs);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

// ✅ Swipe a job (like/dislike)
export const swipeJob = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, jobId, liked } = req.body;

    await db.collection("swipes").add({
      userId,
      jobId,
      liked,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

// ✅ Apply for a job
export const applyJob = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, jobId } = req.body;

    await db.collection("applications").add({
      userId,
      jobId,
      status: "pending",
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});