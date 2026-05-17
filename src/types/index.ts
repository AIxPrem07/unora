import type { ComponentType } from "react";

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
}
