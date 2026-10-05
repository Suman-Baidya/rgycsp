import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isActive?: boolean;
      systemPermissions?: any;
      isDeveloper?: boolean;
      isDemo?: boolean;
      originalUserId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    isActive?: boolean;
    isDeveloper?: boolean;
    isDemo?: boolean;
    systemPermissions?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    isActive?: boolean;
    systemPermissions?: any;
    isDeveloper?: boolean;
    isDemo?: boolean;
    impersonatedUserId?: string;
    impersonatedRole?: string;
    impersonatedName?: string;
    impersonatedEmail?: string;
    impersonatedSystemPermissions?: any;
  }
}
