export const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  manager: "Gerente",
  reservations: "Reservas",
  marketing: "Marketing",
  technical_admin: "Administrador técnico",
};

export const roleDescriptions: Record<string, string> = {
  owner: "Acesso total à hospedagem, equipe, CRM, conteúdo e integrações.",
  manager: "Opera a hospedagem e acompanha CRM, conteúdo e configurações do dia a dia.",
  reservations: "Foco comercial: leads, follow-ups, contatos e rotina de reservas.",
  marketing: "Conteúdo, acomodações, galeria, avaliações e identidade visual.",
  technical_admin: "Acesso técnico total, incluindo integrações e permissões.",
};

export const roleOptions = [
  "owner",
  "manager",
  "reservations",
  "marketing",
  "technical_admin",
] as const;
