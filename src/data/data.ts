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
  github?: string;
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
  resume: "https://drive.google.com/file/d/1eUb-hSrh6sovipaZ7sT_RA9Z8e504XHz/view?usp=share_link",
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
      company: "Bangkit Academy (by Google, GoTo, and Traveloka)",
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
    title: "Open Bank",
    description: "A modern, open-source banking platform currently under development.",
    story: "This project is currently in the works. It aims to provide a comprehensive, secure, and highly scalable open-source banking platform.",
    details: [
      "Architecture and feature set are actively being finalized.",
      "Focused on building a robust backend for financial transactions."
    ],
    tags: ["Go", "PostgreSQL", "Banking", "Fintech"],
    github: "https://github.com/ndy-s/open-bank",
    comingSoon: true,
  },
  {
    title: "Portfolio Website",
    description: "A personal portfolio featuring a real-time N-body physics simulation as its interactive background.",
    story: "This portfolio was designed to be more than a static page. It is a live physics sandbox that turns browsing into an interactive experience. I wanted to build something that reflects my curiosity for space and complex systems, letting users playfully interact with celestial bodies and watch collisions unfold in real-time.",
    details: [
      "Real-time N-body gravitational simulation rendered entirely on HTML5 Canvas.",
      "Synthesized audio feedback generated via the Web Audio API based on physics interactions.",
      "Adaptive rendering pipeline that automatically scales physics fidelity across three performance tiers for stable framerates."
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Canvas", "Web Audio API"],
    github: "https://github.com/ndy-s/portfolio",
  },
  {
    title: "WhatsApp Multi-Agent Ops",
    description: "Multi-agent WhatsApp automation that turns natural conversation into live API calls and SQL operations.",
    story: "Started as an experiment to push agentic AI to handle daily repetitive tasks, this project grew into a full multi-agent system. The goal was to replace context-switching between SQL editors and internal tools with a simple conversational interface on WhatsApp. By chatting with the bot like a coworker, requests are seamlessly routed to specialized agents capable of executing tasks.\n\nP.S. This was built as an early exploration when AI agents were just emerging and served primarily for learning purposes. There are likely more established solutions for this today.",
    details: [
      "Multi-agent architecture utilizing LangChain, Gemini, and DeepSeek for dynamic request routing and task delegation.",
      "Retrieval-Augmented Generation (RAG) with MiniLM embeddings to pull only relevant API/DB registries into context.",
      "Secure SQL execution restricted to predefined, human-reviewed queries with a 60-second user confirmation window.",
      "Self-healing validation-and-retry loops to catch and correct malformed structured outputs before execution.",
      "Operates entirely on free-tier models for zero-cost daily running with an easy swap-in path for paid models."
    ],
    tags: ["Node.js", "LangChain", "Baileys", "Gemini", "DeepSeek", "Vector Embeddings"],
    github: "https://github.com/ndy-s/wa-multi-agent-ops",
    media: [
      {
        type: "image",
        src: "https://raw.githubusercontent.com/ndy-s/wa-multi-agent-ops/main/assets/api-agent-demo.gif",
        alt: "API Agent Demo"
      },
      {
        type: "image",
        src: "https://raw.githubusercontent.com/ndy-s/wa-multi-agent-ops/main/assets/sql-agent-demo.gif",
        alt: "SQL Agent Demo"
      }
    ]
  },
  {
    title: "Puppet Browser",
    description: "A lightweight web app to remotely control a headless browser across a local network.",
    story: "Born out of curiosity about how remote desktop connections work, I built a lightweight version that targets just a web browser. Using Puppeteer and Socket.IO, it streams the browser's view and transmits keyboard/mouse inputs over a local network, giving offline PCs a fully functional browser without needing direct internet access.",
    details: [
      "Uses Puppeteer to launch and interact with a Chromium instance programmatically.",
      "Real-time screenshot capture and streaming to the client via Socket.IO.",
      "Intercepts and transmits complex input events (clicks, scrolls, keyboard) and handles cross-device clipboard operations.",
      "Implements a sequential action queue to prevent overlapping commands and manual history management."
    ],
    tags: ["Node.js", "Puppeteer", "Socket.IO", "Remote Control"],
    github: "https://github.com/ndy-s/puppet-browser",
    media: [
      {
        type: "image",
        src: "https://raw.githubusercontent.com/ndy-s/puppet-browser/main/assets/preview.gif",
        alt: "Puppet Browser Demo"
      }
    ]
  },
  {
    title: "AI Fitness Tracker",
    description: "A personal fitness coach that tracks workouts, meals, and progress via conversational messaging.",
    story: "I wanted a simpler way to track my fitness progress without navigating complicated app menus. This assistant acts like a personal coach on WhatsApp or Telegram, estimating calories, logging workouts, and providing intelligent daily check-ins. It handles natural language seamlessly, so you can just text what you ate or lifted and the AI does the rest.",
    details: [
      "Multi-provider AI fallback system integrating Gemini 2.5 Flash and DeepSeek V4 for high reliability.",
      "Local Node.js backend with an interactive React Vite glassmorphism dashboard.",
      "Integrates with WhatsApp (via Baileys) and Telegram for a natural conversational interface.",
      "Background scheduler utilizing node-cron for proactive intelligent check-ins based on meal timings."
    ],
    tags: ["React", "Node.js", "Gemini", "DeepSeek", "Baileys", "SQLite"],
    github: "https://github.com/ndy-s/ai-fitness-tracker",
    media: [
      {
        type: "image",
        src: "https://raw.githubusercontent.com/ndy-s/ai-fitness-tracker/main/assets/ui.jpeg",
        alt: "AI Fitness Tracker Dashboard"
      }
    ]
  },
  {
    title: "Quest OS",
    description: "An Obsidian vault that acts as a local operating system for your ambitions, powered by Claude and MCP.",
    story: "I wanted my goals to feel like quests in a video game rather than chores. Quest OS automates the daily planning overhead by generating a structured journey system and integrating with Claude via the Model Context Protocol (MCP). You define your goal once, and the system handles the daily execution loop locally within your Obsidian vault.",
    details: [
      "Uses Model Context Protocol (MCP) to allow Claude to read and write directly to a local Obsidian vault.",
      "Automates project planning and progress tracking using custom system prompts and a daily quest loop.",
      "Designed as a closed-loop system where AI handles meta-work so you can focus on execution."
    ],
    tags: ["Obsidian", "Claude", "MCP", "Docker", "Productivity"],
    github: "https://github.com/ndy-s/quest-os",
  },
  {
    title: "AutOTP",
    description: "A browser extension that locally stores TOTP secrets and autofills 2FA codes.",
    story: "I built this out of frustration with the daily ritual of reaching for my phone to check 2FA codes every time I logged into an account. It is a browser extension that stores TOTP secrets locally and seamlessly autofills the six-digit codes when a login page is detected. It is designed for convenience without relying on cloud sync or remote servers.",
    details: [
      "Stores TOTP secrets securely in browser-encrypted local storage without external network requests.",
      "Automatically detects and autofills 2FA input fields across various websites and SPAs.",
      "Supports adding secrets by pasting screenshots or uploading QR code images directly.",
      "Built with TypeScript and Vite, fully compliant with Manifest V3."
    ],
    tags: ["TypeScript", "Vite", "Browser Extension", "Security"],
    github: "https://github.com/ndy-s/auto-otp",
  },
  {
    title: "Expense & Fixed Asset Management System (EFAMS)",
    description: "A transactional dashboard template inspired by enterprise banking systems, built for the modern web.",
    story: "I built this to explore how the robust, rigid design patterns of enterprise banking applications could be adapted to a modern frontend stack. Discontent with the clunky designs at my previous job, I extracted core banking concepts, like strict page modes, menu codes, and persistent global context, and applied them to a clean React application built with Vite.",
    details: [
      "Implements strict page modes (Entry, Cancel, Inquiry) to rigidly control data workflows.",
      "Uses a global context bar to persist session information like transaction date, branch, and user group.",
      "Features native client-side parsing of raw .xlsx files using exceljs and xlsx for batch uploads and reporting.",
      "Provides quick navigation through structured Menu Codes (e.g., EP11, FA01)."
    ],
    tags: ["React", "Vite", "Dashboard", "Banking"],
    github: "https://github.com/ndy-s/efams",
    media: [
      {
        type: "image",
        src: "https://raw.githubusercontent.com/ndy-s/efams/main/assets/preview.png",
        alt: "EFAMS Dashboard"
      }
    ]
  },
  {
    title: "Anitopia",
    description: "A text-based anime RPG Discord bot featuring turn-based battles and character collection.",
    story: "This is my oldest and most ambitious project: a full-fledged turn-based RPG built right into Discord. You can summon characters, build teams, and duel other players. The complexities eventually outgrew what I could manage alone, so it remains incomplete, but the core mechanics and robust user experience features are fully functional. With the current capabilities of AI coding agents, I plan to revisit and develop it much faster in the future.",
    details: [
      "Developed a complete turn-based RPG battle system accessible entirely via Discord slash commands.",
      "Built an extensive character collection and gacha system with daily summons and team management.",
      "Maximized user experience by integrating advanced profile customization and interactive menus.",
      "Backed by MongoDB and Redis for high-performance state management and data persistence."
    ],
    tags: ["Discord Bot", "Node.js", "MongoDB", "Redis", "RPG"],
    github: "https://github.com/ndy-s/anitopia",
    media: [
      {
        type: "image",
        src: "https://raw.githubusercontent.com/ndy-s/anitopia/main/src/public/anitopia_demo.png",
        alt: "Anitopia Character Collection"
      }
    ]
  }
];
