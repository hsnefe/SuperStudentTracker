import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import { deleteCourseCoverImage } from "./uploadCourseCoverImage";

export async function deleteCourse(courseId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const db = getFirebaseFirestore();

  const assignmentsQuery = query(
    collection(db, "assignments"),
    where("course_id", "==", courseId),
  );
  const assignmentSnaps = await getDocs(assignmentsQuery);

  await Promise.all([
    deleteDoc(doc(db, "courses", courseId)),
    deleteDoc(doc(db, "courseSchedules", courseId)),
    deleteDoc(doc(db, "courseGradeBreakdowns", courseId)),
    deleteDoc(doc(db, "courseAssignments", courseId)),
    ...assignmentSnaps.docs.map((d) => deleteDoc(d.ref)),
    deleteCourseCoverImage(courseId),
  ]);
}
