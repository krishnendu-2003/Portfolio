export const aboutMe = {
  name: "Krishnendu Samanta",
  tagline: "AI/ML and frontend engineer building Lumeo.",
  paragraphs: [
    "AI/ML and frontend engineer based in Kolkata. Currently CTO & Co-founder at Lumeo, an AI-native financial operating system for Indian independent workers and exporters — I own the machine-learning layer (five production models behind a Python inference service) end-to-end, along with the entire frontend.",
    "Alongside Lumeo, I'm a Software Developer Intern at Tech Vortex Ventures, building and maintaining a React Native mobile app and web platform — real-time chat over WebSockets, push notifications, Firebase auth. Before that, at Catoff Gaming, I integrated live data for Fortnite, Marvel Rivals, and CS:GO, streamlining project workflows and cutting overhead by 25%.",
    "Outside of work I build things I care about: FirmDev, an in-browser IoT development tool that generates Arduino code with Gemini; SwitchSocial, a Solana-based platform for creator monetization; and Luminere, a full site build for a content agency. Two-time hackathon winner — Prayash 2024 (hardware) and Binary 2025 (deepfake detection) — and a Superteam India contributor.",
    "B.Tech in Computer Science and Engineering from Sister Nivedita University (MAKAUT), Kolkata — graduated 2026, specializing in Artificial Intelligence and Machine Learning.",
  ],
};

export const whatIDo = {
  paragraphs: [
    "I work across the stack on AI-native products, but I live at the intersection of the two hardest parts: the machine-learning layer that has to be right, and the frontend that has to make it feel simple.",
    "At Lumeo I own both — the production model layer and the entire frontend — which means I spend most of my time translating between what a model can guarantee and what a product can promise.",
  ],
  chips: [
    "Machine Learning",
    "Python",
    "Frontend Engineering",
    "React / Next.js",
    "Product Architecture",
  ],
};

export const resume = {
  name: "Krishnendu Samanta",
  title:
    "React Native & React.js Engineer | TypeScript · Mobile + Web · REST APIs · 0-to-1 Product Work",
  location: "Kolkata, India",
  contact: {
    email: "skrishnendu115@gmail.com",
    phone: "+91 8910886505",
    location: "Kolkata, India",
    github: "github.com/krishnendu-2003",
    linkedin: "linkedin.com/in/echowhisper",
  },
  objective:
    "Product-minded engineer with 1+ year of experience building mobile and web applications from the ground up in React Native and React.js. Has taken features from zero to shipped across a React Native (Expo) mobile app and a React.js web platform on a shared REST API — building reusable, high-performance components and integrating backend APIs, authentication and third-party services. Works in TypeScript, owns features end to end from development through release, and has repeatedly built complete products under tight constraints, winning two hackathons. B.Tech in Computer Science and Engineering with an AI/ML specialization, CGPA 7.5, graduating August 2026.",
  skills: [
    {
      label: "Languages",
      value: "JavaScript (ES6+), TypeScript, Java, SQL, Python, C++",
    },
    {
      label: "Frontend",
      value:
        "React.js, React Native (Expo), Redux, React Context API, Next.js, React hooks, HTML5, CSS3, responsive design, reusable components, state management",
    },
    {
      label: "Mobile",
      value:
        "React Native (Expo) for Android and iOS, Android builds and APK generation via Android Studio and Expo, push notifications, app store release support",
    },
    {
      label: "Performance & Quality",
      value:
        "Reusable component libraries, responsive and cross-device testing, UI performance optimization, cross-browser compatibility, debugging and issue resolution",
    },
    {
      label: "Backend",
      value:
        "Node.js, Express.js, REST API design, RESTful web services, JSON, WebSocket, Java, Spring Boot, Spring Data JPA, Hibernate",
    },
    {
      label: "Databases",
      value: "MongoDB, MySQL, PostgreSQL — schema design and data modelling",
    },
    {
      label: "AI Integration",
      value:
        "Gemini API integration into a production browser tool, computer-vision model serving, B.Tech specialization in Artificial Intelligence and Machine Learning",
    },
    {
      label: "Tools",
      value:
        "Git and GitHub, npm, Postman, Android Studio, Firebase (Authentication, Cloud Messaging), Vercel, Chrome DevTools",
    },
    {
      label: "Practices",
      value:
        "Component architecture, API integration, code review, responsive and cross-device testing, UI performance optimization, Agile collaboration, problem solving, communication",
    },
  ],
  experience: [
    {
      role: "Software Developer Intern",
      org: "Tech Vortex Ventures Private Limited, Kolkata",
      period: "Jun 2025 – Present",
      bullets: [
        "Own features end to end across a React Native (Expo) mobile application and a React.js web platform served by a shared REST API layer, keeping one contract consistent across two clients.",
        "Manage application state with Redux and the React Context API, and build reusable UI components that follow the existing application design patterns.",
        "Built a real-time chat interface over WebSocket connections with push notifications — optimistic message rendering, reconnection handling, and foreground/background message states.",
        "Implemented authentication and session handling with Firebase Authentication, and push notifications through Firebase Cloud Messaging from server-side trigger to device delivery.",
        "Fix bugs and improve application stability, performance and usability across both clients, working from user-reported issues through to release.",
      ],
    },
    {
      role: "Software Developer Intern",
      org: "Catoff Gaming, Remote",
      period: "Mar 2025 – Jun 2025",
      bullets: [
        "Integrated three third-party game platform APIs (Fortnite, Marvel Rivals, CS:GO) into the React.js and TypeScript client, with JSON data normalization and user-facing error, loading and empty states.",
        "Streamlined project workflow and delivery process, improving team efficiency by approximately 25%.",
      ],
    },
  ],
  projects: [
    {
      name: "SwitchSocial",
      description:
        "Creator monetization platform with both a React.js web client and a React Native mobile client on a shared Express.js REST API. Built the component library and screen flows for both clients, sharing Redux state patterns across web and mobile.",
      stack: "React.js, React Native, Redux, Node.js, Express.js, MongoDB",
    },
    {
      name: "FirmDev",
      description:
        "Browser-based development tool and browser extension for IoT projects, removing the need for multiple desktop software installs. Built the React.js interface that generates Arduino code snippets through the Gemini API and pushes them directly to the connected board.",
      stack: "React.js, Node.js, Express.js, Python, Gemini API",
    },
    {
      name: "Deepfake Detection System",
      description:
        "Built the React.js web interface for a computer-vision classifier detecting manipulated video and imagery. Winner, Binary 2025 (Kalyani Govt. College).",
      stack: "React.js, Python, Deep-learning CV models",
    },
  ],
  achievements: [
    "Hackathon Winner, Binary 2025 — Kalyani Govt. College (Deepfake Detection System)",
    "Hackathon Winner, Prayash 2024 — Techno India Batanagar (Hardware Project)",
    "Contributor, Superteam India — Web3 developer ecosystem",
  ],
  education: [
    {
      degree: "B.Tech, Computer Science and Engineering",
      school: "Sister Nivedita University (MAKAUT), Kolkata",
      detail:
        "Specialization: Artificial Intelligence and Machine Learning. CGPA: 7.5",
      period: "Sep 2022 – Aug 2026",
    },
    {
      degree: "Higher Secondary, Science",
      school: "Julien Day School, Kolkata",
      detail: "",
      period: "2022",
    },
  ],
  additional: {
    "Languages Spoken": "English, Bengali, Hindi",
    Certifications: "Rinex Start-A-Thon; Campus Ambassador",
  },
  volunteering: [
    "Institution's Innovation Council (IIC) Regional Meet",
    "Google Developer Student Clubs (GDSC)",
    "Udyog Entrepreneurship Program",
  ],
};
