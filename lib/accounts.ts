import type { Role } from "@/lib/types";

export type DemoAccount = {
  role: Role;
  email: string;
  password: string;
  title: string;
  detail: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "editor",
    email: "editor@frontier.demo",
    password: "Frontier-edit-2026",
    title: "Editor",
    detail: "Click any wording in the roadmap to change it. Edits save on this server and stay after a refresh.",
  },
  {
    role: "viewer",
    email: "viewer@frontier.demo",
    password: "Frontier-view-2026",
    title: "Viewer",
    detail: "Read the roadmap. There are no edit controls, and content cannot be changed.",
  },
];

export function findAccount(email: string, password: string) {
  const normalised = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find(
    (account) => account.email === normalised && account.password === password.trim(),
  );
}
