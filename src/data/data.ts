import { IconType } from "react-icons";
import {
  SiPython,
  SiGo,
  SiTypescript,
  SiJavascript,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiNodedotjs,
  SiSpringboot,
  SiLaravel,
  SiDocker,
  SiKubernetes,
  SiPostgresql,
  SiGooglecloud,
} from "react-icons/si";
import { FaJava, FaAws } from "react-icons/fa";

export type Experience = {
  title: string;
  company: string;
  date: string;
  link?: string;
};

export type Technology = {
  name: string;
  icon: IconType;
};

export type ProjectMedia = {
  type: "image" | "video";
  src: string;
  alt?: string;
};

export type Project = {
  title: string;
  description: string;
  details: string[];
  tags: string[];
  link?: string;
  github?: string;
  demo?: string;
  media?: ProjectMedia[];
};

export const CONTENT = {
  subtitle: "Software Engineer",
  about: `I build things that work well and scale, from core banking systems processing thousands of loan applications to campus-wide platforms serving entire universities. Over the past 2+ years, I've turned a curiosity for breaking and understanding software into real production impact.

Currently a Software Engineer at Next TI (Hana Financial Group), I specialize in backend architecture, API orchestration, and performance optimization. I've cut API response times from 40s to 2s, designed multi-bank payment integrations, and built automated loan workflows from scratch.

Outside of my full-time role, I take on freelance projects to help businesses build reliable, modern web applications. Whether you need a performant backend, a clean full-stack product, or a custom internal tool, I'd love to hear about it. I also explore Deep Learning, Computer Vision, and NLP at the intersection of Software Engineering and ML.`,
  sections: {
    services: { 
      title: "Freelance Services", 
      subtitle: "How I can help your business build and scale." 
    },
    experience: { title: "Work Experience", subtitle: "" },
    technologies: { title: "Technologies", subtitle: "" },
    projects: { title: "Featured Projects", subtitle: "" },
    connect: {
      title: "Connect",
      text: "Have a project in mind? Let's build something great together. I am currently taking on new freelance clients.",
    },
    footer: "All rights reserved.",
  }
};

export const DATA = {
  name: "Hendy Saputra",
  email: "hendys.work@gmail.com",
  github: "https://github.com/ndy-s",
  linkedin: "https://www.linkedin.com/in/hendy-saputra/",
  experience: [
    {
      title: "Software Engineer",
      company: "Next TI (Hana Financial Group)",
      date: "May 2025 - Present",
    },
    {
      title: "AI Coding Consultant",
      company: "Outlier (by Scale AI)",
      date: "Mar 2026 - May 2026",
    },
    {
      title: "Software Engineer",
      company: "University of Riau (ICT Division)",
      date: "Jan 2024 - Apr 2025",
    },
    {
      title: "Research Assistant",
      company: "University of Riau",
      date: "Aug 2023 - Dec 2023",
    },
    {
      title: "Machine Learning Mentor",
      company: "Bangkit Academy",
      date: "Feb 2024 - Jul 2024",
    },
    {
      title: "Software Engineer Intern",
      company: "Bank Rakyat Indonesia",
      date: "Jan 2023 - Feb 2023",
    },
  ] as Experience[],
  technologies: [
    { name: "Java", icon: FaJava },
    { name: "Python", icon: SiPython },
    { name: "Go", icon: SiGo },
    { name: "TypeScript", icon: SiTypescript },
    { name: "JavaScript", icon: SiJavascript },
    { name: "React", icon: SiReact },
    { name: "Next.js", icon: SiNextdotjs },
    { name: "Vue.js", icon: SiVuedotjs },
    { name: "Node.js", icon: SiNodedotjs },
    { name: "Spring Boot", icon: SiSpringboot },
    { name: "Laravel", icon: SiLaravel },
    { name: "Docker", icon: SiDocker },
    { name: "Kubernetes", icon: SiKubernetes },
    { name: "PostgreSQL", icon: SiPostgresql },
    { name: "AWS", icon: FaAws },
    { name: "GCP", icon: SiGooglecloud },
  ] as Technology[],
};

export const PROJECTS: Project[] = [
  {
    title: "Portfolio Website",
    description: "My personal portfolio website built with Next.js, Tailwind CSS, and Framer Motion.",
    details: [
      "Designed a minimalist, single-page layout inspired by modern design trends.",
      "Implemented smooth scroll animations and typing effects using Framer Motion.",
      "Built with dark/light mode toggle via next-themes and custom CSS variables.",
      "Fully responsive and optimized for mobile viewing."
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/ndy-s",
    demo: "https://github.com/ndy-s",
  },
  {
    title: "Sentiment Analysis with LLMs",
    description: "Fine-tuned Transformer-based LLMs on large-scale student feedback data for NLP sentiment analysis research.",
    details: [
      "Pre-processed and cleaned massive datasets of student feedback.",
      "Fine-tuned pre-trained Transformer models (BERT, RoBERTa) using PyTorch and Hugging Face.",
      "Achieved high accuracy in categorizing student sentiment to improve institutional feedback loops.",
      "Published research findings in an academic journal."
    ],
    tags: ["Python", "PyTorch", "Hugging Face"],
    github: "https://github.com/ndy-s",
  },
  {
    title: "Payment Gateway Integration",
    description: "Developed a multi-bank payment gateway integration, reducing onboarding time per banking partner by ~33%.",
    details: [
      "Architected a unified payment API abstraction layer for multiple banking providers.",
      "Implemented secure transaction processing, webhook handling, and status reconciliation.",
      "Utilized RabbitMQ for reliable asynchronous message queues to handle high loads.",
      "Reduced integration friction and partner onboarding time significantly."
    ],
    tags: ["PHP", "Laravel", "RabbitMQ"],
    github: "https://github.com/ndy-s",
  },
  {
    title: "Core Banking Optimization",
    description: "Identified and resolved a critical core banking performance bottleneck across API and SQL layers.",
    details: [
      "Conducted deep analysis of API latency and SQL execution plans under high traffic.",
      "Implemented strategic indexing and query optimization, reducing response latency from ~40s to ~2s.",
      "Designed autonomous loan workflows using API orchestration and async batch processing.",
      "Enabled straight-through processing for the majority of loan applications."
    ],
    tags: ["Java", "Spring Boot", "PostgreSQL"],
    github: "https://github.com/ndy-s",
  },
];
