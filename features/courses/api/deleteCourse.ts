import { deleteDoc } from "firebase/firestore";
import { getFirebaseFirestore, isFirebaseConfigured } from "@/lib/firebase";
import {
  userCourseAssignmentDoc,
  userCourseDoc,
  userCourseGradeBreakdownDoc,
  userCourseScheduleDoc,
} from "@/lib/firestore/userPaths";
import { deleteCourseCoverImage } from "./uploadCourseCoverImage";

export async function deleteCourse(uid: string, courseId: string): Promise<void> {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase is not configured");
  }

  const db = getFirebaseFirestore();

  await Promise.all([
    deleteDoc(userCourseDoc(db, uid, courseId)),
    deleteDoc(userCourseScheduleDoc(db, uid, courseId)),
    deleteDoc(userCourseGradeBreakdownDoc(db, uid, courseId)),
    deleteDoc(userCourseAssignmentDoc(db, uid, courseId)),
    deleteCourseCoverImage(uid, courseId),
  ]);
}
