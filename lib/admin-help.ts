export type CriartistaHelpTone = "default" | "warning" | "success";

export type CriartistaHelpMessage = {
  eyebrow: string;
  title: string;
  body: string;
  details?: string[];
  actions?: Array<{ href: string; label: string }>;
  tone?: CriartistaHelpTone;
};

export const CRIARTISTA_HELP_EVENT = "criartista:help";
export const CRIARTISTA_HELP_CLEAR_EVENT = "criartista:help-clear";

export function showCriartistaHelp(message: CriartistaHelpMessage) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<CriartistaHelpMessage>(CRIARTISTA_HELP_EVENT, {
      detail: message,
    })
  );
}

export function clearCriartistaHelp() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CRIARTISTA_HELP_CLEAR_EVENT));
}
