import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBR9twycDE3rwONsmjlAq58PEHiC6qh6D8",
  authDomain: "superstudenttracker.firebaseapp.com",
  projectId: "superstudenttracker",
  storageBucket: "superstudenttracker.firebasestorage.app",
  messagingSenderId: "323802451509",
  appId: "1:323802451509:web:0ad3f71daf669806372b7c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const courses = [
  {
    id: "mock-cv",
    title: "Introduction to Computer Vision and Image Processing",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=640&q=80",
    lecturer_name: "Dr. Elena Vasquez",
    absence_tolerance_hours: 6,
  },
  {
    id: "mock-prompt",
    title: "Essentials of Prompt Engineering",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=640&q=80",
    lecturer_name: "Prof. James Okonkwo",
    absence_tolerance_hours: 4,
  },
  {
    id: "mock-cloud",
    title: "Cloud Application Development Foundations",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80",
    lecturer_name: "Dr. Mei Lin",
    absence_tolerance_hours: 8,
  },
];

const assignmentCountSource = [
  { id: "as-1", course_id: "mock-cv" },
  { id: "as-2", course_id: "mock-cv" },
  { id: "as-3", course_id: "mock-prompt" },
  { id: "as-4", course_id: "mock-cloud" },
  { id: "as-5", course_id: "mock-cloud" },
];

const courseAssignments = {
  "mock-cv": [
    {
      id: "a1",
      courseId: "mock-cv",
      title: "Assignment 1",
      description: "Task Description dbasbdhsabdhabjasdnjas",
      type: "essay",
      deadline: "2026-05-20",
      priority: "high",
      status: "in_progress",
      tasks: [
        { id: "t1", title: "Task 1", done: true },
        { id: "t2", title: "Task 2", done: false },
        { id: "t3", title: "Task3s", done: false },
      ],
    },
  ],
  "mock-prompt": [
    {
      id: "a2",
      courseId: "mock-prompt",
      title: "Assignment 2",
      description: "Task Description dbasbdhsabdhabjasdnjas",
      type: "group_project",
      deadline: "2026-06-01",
      priority: "medium",
      status: "not_started",
      tasks: [
        { id: "t4", title: "Task 1", done: true },
        { id: "t5", title: "Task 2", done: true },
        { id: "t6", title: "Task3s", done: false },
      ],
    },
  ],
  "mock-cloud": [
    {
      id: "a3",
      courseId: "mock-cloud",
      title: "Assignment 3",
      description: "Task Description dbasbdhsabdhabjasdnjas",
      type: "exam",
      deadline: "2026-05-28",
      priority: "emergent",
      status: "pending_review",
      tasks: [
        { id: "t7", title: "Task 1", done: false },
        { id: "t8", title: "Task 2", done: false },
        { id: "t9", title: "Task3s", done: false },
      ],
    },
  ],
  __none__: [
    {
      id: "a-orphan",
      courseId: "__none__",
      title: "Personal reading log",
      description: "",
      type: "reading",
      deadline: "2026-05-15",
      priority: "low",
      status: "not_started",
      tasks: [],
    },
  ],
};

const courseGradeBreakdowns = {
  "mock-cv": [
    { id: "g-mid", label: "Midterm", weightPercent: 30, scoreText: "66" },
    { id: "g-q1", label: "Quiz1", weightPercent: 30, scoreText: "92" },
    { id: "g-fin", label: "Final", weightPercent: 40, scoreText: "TBA" },
  ],
  "mock-prompt": [
    { id: "g-p1", label: "Project", weightPercent: 50, scoreText: "TBA" },
    { id: "g-p2", label: "Participation", weightPercent: 50, scoreText: "TBA" },
  ],
  "mock-cloud": [
    { id: "g-labs", label: "Labs", weightPercent: 35, scoreText: "88" },
    { id: "g-exam", label: "Exam", weightPercent: 65, scoreText: "TBA" },
  ],
};

for (const course of courses) {
  await setDoc(doc(db, "courses", course.id), course);
}

for (const row of assignmentCountSource) {
  await setDoc(doc(db, "assignments", row.id), row);
}

for (const [courseId, assignments] of Object.entries(courseAssignments)) {
  await setDoc(doc(db, "courseAssignments", courseId), {
    assignments,
    updatedAt: new Date().toISOString(),
  });
}

for (const [courseId, rows] of Object.entries(courseGradeBreakdowns)) {
  await setDoc(doc(db, "courseGradeBreakdowns", courseId), {
    rows,
    updatedAt: new Date().toISOString(),
  });
}

const courseSchedules = {
  "mock-cv": [
    {
      id: "sch-cv-1",
      courseId: "mock-cv",
      weekday: 2,
      startMinutes: 10 * 60,
      endMinutes: 11 * 60 + 30,
      location: "Lab 204",
    },
    {
      id: "sch-cv-2",
      courseId: "mock-cv",
      weekday: 4,
      startMinutes: 14 * 60,
      endMinutes: 15 * 60 + 30,
      location: "Hall B",
    },
  ],
  "mock-prompt": [
    {
      id: "sch-pe-1",
      courseId: "mock-prompt",
      weekday: 1,
      startMinutes: 9 * 60 + 30,
      endMinutes: 11 * 60,
      location: "Room 101",
    },
  ],
  "mock-cloud": [
    {
      id: "sch-cl-1",
      courseId: "mock-cloud",
      weekday: 3,
      startMinutes: 13 * 60,
      endMinutes: 15 * 60,
      location: "Online",
    },
    {
      id: "sch-cl-2",
      courseId: "mock-cloud",
      weekday: 5,
      startMinutes: 10 * 60,
      endMinutes: 12 * 60,
    },
  ],
};

for (const [courseId, slots] of Object.entries(courseSchedules)) {
  await setDoc(doc(db, "courseSchedules", courseId), {
    slots,
    updatedAt: new Date().toISOString(),
  });
}

console.log("Seed complete.");
