import { IconType } from "react-icons";
import {
  SiPython,
  SiGo,
  SiTypescript,
  SiJavascript,
  SiHtml5,
  SiSpringboot,
  SiNodedotjs,
  SiExpress,
  SiReact,
  SiNextdotjs,
  SiVuedotjs,
  SiLaravel,
  SiRabbitmq,
  SiPytorch,
  SiApachespark,
  SiDocker,
  SiKubernetes,
  SiJenkins,
  SiElasticsearch,
  SiPostgresql,
  SiMongodb,
  SiGooglecloud,
  SiApachekafka,
} from "react-icons/si";
import { FaJava, FaAws, FaDatabase, FaBrain, FaRobot, FaSync } from "react-icons/fa";
import { GrOracle } from "react-icons/gr";

export type Experience = {
  title: string;
  company: string;
  date: string;
  link?: string;
};

export type Service = {
  title: string;
  description: string;
  icon: string;
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
  about: `My journey in software began with a simple obsession: understanding how things work by taking them apart, and rebuilding them until they made sense. That obsession has since evolved into real hands-on experience designing production-grade systems, from core banking loan solutions to insurance expense platforms and campus-wide systems, always built with reliability, performance, and scale in mind.
  
I have a genuine passion for turning ambiguous, messy requirements into clean, well-structured solutions, and I take real satisfaction in automating away the tedious parts of any workflow. While backend architecture is where I specialize, I'm equally drawn to Machine Learning and AI, and I enjoy exploring the space where the two intersect.

Beyond the screen, I'm an introvert with a deep appreciation for traveling and being in nature, there's something quietly powerful about standing somewhere new and simply taking it in. I'm also a creator at heart, drawing and building small open-source tools in my spare time. My biggest dream is to travel the world, one meaningful place at a time.`,
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
  services: [
    {
      title: "App Development",
      description: "I design and build mobile, desktop, and web applications from concept to launch, engineered for performance and long-term scalability.",
      icon: "📱"
    },
    {
      title: "Work Automation",
      description: "I help businesses eliminate repetitive manual processes through custom automation, reducing errors and freeing up time for high-value work.",
      icon: "⚙️"
    },
    {
      title: "AI Integration",
      description: "I implement practical AI capabilities into products and operations, delivering real improvements in efficiency and customer experience.",
      icon: "✨"
    }
  ] as Service[],
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
    { name: "SQL", icon: FaDatabase },
    { name: "HTML/CSS", icon: SiHtml5 },
    { name: "Spring", icon: SiSpringboot },
    { name: "Node.js", icon: SiNodedotjs },
    { name: "Express.js", icon: SiExpress },
    { name: "React.js", icon: SiReact },
    { name: "Next.js", icon: SiNextdotjs },
    { name: "Vue.js", icon: SiVuedotjs },
    { name: "Laravel", icon: SiLaravel },
    // { name: "Kafka", icon: SiApachekafka },
    { name: "RabbitMQ", icon: SiRabbitmq },
    { name: "PyTorch", icon: SiPytorch },
    { name: "LangChain", icon: FaRobot },
    { name: "PySpark", icon: SiApachespark },
    { name: "Deep Learning", icon: FaBrain },
    { name: "AWS", icon: FaAws },
    { name: "GCP", icon: SiGooglecloud },
    { name: "Docker", icon: SiDocker },
    { name: "Kubernetes", icon: SiKubernetes },
    { name: "CI/CD", icon: FaSync },
    { name: "Jenkins", icon: SiJenkins },
    { name: "Elastic Stack", icon: SiElasticsearch },
    { name: "PostgreSQL", icon: SiPostgresql },
    { name: "Oracle", icon: GrOracle },
    { name: "MongoDB", icon: SiMongodb },
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
];
