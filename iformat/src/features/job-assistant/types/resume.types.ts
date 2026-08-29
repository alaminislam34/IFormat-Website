export interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  workExperience: Array<{
    id: string;
    company: string;
    role: string;
    duration: string;
    location: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    duration: string;
    location: string;
  }>;
  skillGroups: Array<{
    id: string;
    category: string;
    skills: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    link: string;
  }>;
  languages: string;
  interests: string;
}

export const DEFAULT_RESUME: ResumeData = {
  fullName: "MD Sifat Islam",
  jobTitle: "Senior Full Stack Developer",
  email: "sifat70640@gmail.com",
  phone: "+33 6 12 34 56 78",
  location: "Paris, France",
  linkedin: "linkedin.com/in/johndoe",
  website: "johndoe.com",
  summary: "Passionate Full Stack Developer with 5+ years of experience building high-performance web applications. Expert in React, Next.js, Node.js, and modern cloud architectures.",
  workExperience: [
    {
      id: "1",
      company: "Vercel Inc",
      role: "Senior Full Stack Developer",
      duration: "Jan 2020 - Present",
      location: "Remote",
      description: "Led development of core developer dashboard features.\nOptimized Next.js page loading times by 40%.\nMentored junior engineers and designed scalable database schemas."
    }
  ],
  education: [
    {
      id: "1",
      institution: "Sorbonne University",
      degree: "Master of Computer Science",
      duration: "2018 - 2020",
      location: "Paris, France"
    }
  ],
  skillGroups: [
    {
      id: "1",
      category: "Frontend",
      skills: "React, Next.js, TypeScript, Tailwind CSS, Redux"
    },
    {
      id: "2",
      category: "Backend",
      skills: "Node.js, NestJS, Express, PostgreSQL, Redis, GraphQL"
    }
  ],
  certifications: [
    {
      id: "1",
      name: "AWS Certified Solutions Architect",
      link: "https://aws.amazon.com"
    }
  ],
  languages: "English: Native, French: B2",
  interests: "Open Source Contributions, Artificial Intelligence, Running, Web Performance"
};
