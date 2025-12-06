export interface Project {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  status: "active" | "archived" | "draft";
}

export const dummyProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-featured online shopping platform with inventory management, payment processing, and customer analytics.",
    createdAt: "Dec 3, 2024",
    status: "active",
  },
  {
    id: "2",
    title: "Healthcare Portal",
    description: "Patient management system with appointment scheduling, medical records, and telemedicine integration.",
    createdAt: "Nov 28, 2024",
    status: "active",
  },
  {
    id: "3",
    title: "Learning Management System",
    description: "Educational platform supporting course creation, student enrollment, and progress tracking.",
    createdAt: "Nov 15, 2024",
    status: "draft",
  },
  {
    id: "4",
    title: "CRM Dashboard",
    description: "Customer relationship management tool with lead tracking, sales pipeline, and reporting features.",
    createdAt: "Oct 22, 2024",
    status: "archived",
  },
  {
    id: "5",
    title: "Inventory Management",
    description: "Warehouse management solution with real-time stock tracking and automated reordering.",
    createdAt: "Oct 10, 2024",
    status: "active",
  },
  {
    id: "6",
    title: "HR Portal",
    description: "Human resources platform for employee onboarding, performance reviews, and payroll management.",
    createdAt: "Sep 28, 2024",
    status: "draft",
  },
];
