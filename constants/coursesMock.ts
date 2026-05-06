/** Fallback grid items when Firebase is unavailable or queries fail. */
export type CourseGridItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  assignmentCount: number;
};

export const MOCK_COURSES_FALLBACK: CourseGridItem[] = [
  {
    id: "mock-cv",
    title: "Introduction to Computer Vision and Image Processing",
    imageUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=640&q=80",
    assignmentCount: 7,
  },
  {
    id: "mock-prompt",
    title: "Essentials of Prompt Engineering",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=640&q=80",
    assignmentCount: 4,
  },
  {
    id: "mock-cloud",
    title: "Cloud Application Development Foundations",
    imageUrl:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=640&q=80",
    assignmentCount: 12,
  },
];
