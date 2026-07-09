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
  story?: string;
  details: string[];
  tags: string[];
  link?: string;
  github?: string;
  demo?: string;
  media?: ProjectMedia[];
  comingSoon?: boolean;
};

export const CONTENT = {
  subtitle: "Software Engineer",
  about: `I've always been drawn to taking things apart to understand how they work, then rebuilding them until they made sense. That curiosity shaped my path into backend engineering and system architecture, where I focus on turning ambiguous problems into clean, reliable solutions.
  
Over the years, I've built production-grade systems across core banking (loan origination, payroll, and expense and fixed-asset accounting for insurance), a campus-wide platform, and AI-focused projects including RLHF work for AI coding assistants. I move comfortably across the stack, but what excites me most is the space where software engineering meets machine learning, and the possibilities that emerge when the two intersect.

Beyond the screen, I'm a quiet observer of how the world works, drawn to space (which inspired this site's warp-speed theme), travel, and time spent in nature. I also make art and build small open-source tools whenever I can find the time.`,
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
    description: "A personal portfolio featuring a real-time N-body physics simulation as its interactive background.",
    story: "This portfolio is more than a static page — the background is a live physics sandbox running an N-body gravitational simulation on HTML5 Canvas. Every celestial body has mass and velocity, interacting through Newtonian gravity in real-time. You can grab planets, fling them into black holes, and watch collisions scatter debris with synthesized audio feedback. The rendering pipeline adapts to your device hardware, automatically scaling visual fidelity and physics complexity across three performance tiers to ensure smooth framerates on any device.",
    details: [],
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Canvas", "Web Audio API"],
    github: "https://github.com/ndy-s/portfolio",
    demo: "https://hendy.dev",
    comingSoon: true,
  },
];
