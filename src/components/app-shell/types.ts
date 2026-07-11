export type AppNavKey = "dashboard" | "portfolio" | "evidence" | "editor" | "templates" | "account";

export type AppShellUser = {
  displayName: string;
  email: string;
};

export type AppNavItem = {
  key: AppNavKey;
  href: string;
  label: string;
};
