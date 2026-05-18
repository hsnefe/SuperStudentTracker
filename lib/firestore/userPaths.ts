import { collection, doc, type Firestore } from "firebase/firestore";

export function userCoursesCollection(db: Firestore, uid: string) {
  return collection(db, "users", uid, "courses");
}

export function userCourseDoc(db: Firestore, uid: string, courseId: string) {
  return doc(db, "users", uid, "courses", courseId);
}

export function userCourseAssignmentsCollection(db: Firestore, uid: string) {
  return collection(db, "users", uid, "courseAssignments");
}

export function userCourseAssignmentDoc(db: Firestore, uid: string, courseId: string) {
  return doc(db, "users", uid, "courseAssignments", courseId);
}

export function userCourseSchedulesCollection(db: Firestore, uid: string) {
  return collection(db, "users", uid, "courseSchedules");
}

export function userCourseScheduleDoc(db: Firestore, uid: string, courseId: string) {
  return doc(db, "users", uid, "courseSchedules", courseId);
}

export function userCourseGradeBreakdownsCollection(db: Firestore, uid: string) {
  return collection(db, "users", uid, "courseGradeBreakdowns");
}

export function userCourseGradeBreakdownDoc(db: Firestore, uid: string, courseId: string) {
  return doc(db, "users", uid, "courseGradeBreakdowns", courseId);
}
