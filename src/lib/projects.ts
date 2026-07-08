export type Project = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  demoUrl?: string;
  repoUrl?: string;
  position: [number, number, number];
  color: string;
};

export const projects: Project[] = [
  {
    id: "project-1",
    title: "Smart Consulta",
    description:
      "Plataforma de agendamento médico: busca e marcação de consultas com clínicas e médicos verificados, lembretes automáticos e pagamento seguro.",
    stack: ["Firebase", "Web App"],
    demoUrl: "https://smart-consulta.web.app/",
    position: [-6, 0, -4],
    color: "#4f9dff",
  },
  {
    id: "project-2",
    title: "Projeto Dois",
    description: "Descreva aqui o problema, sua solução e o impacto.",
    stack: ["React", "Node.js", "Redis"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com/",
    position: [6, 0, -4],
    color: "#ff6b6b",
  },
  {
    id: "project-3",
    title: "Projeto Três",
    description: "Descreva aqui o problema, sua solução e o impacto.",
    stack: ["Three.js", "WebGL", "Rust"],
    demoUrl: "https://example.com",
    repoUrl: "https://github.com/",
    position: [0, 0, -10],
    color: "#ffd166",
  },
];
