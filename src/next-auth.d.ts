import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isActive?: boolean;
      systemPermissions?: any;
      isDeveloper?: boolean;
      originalUserId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    isActive?: boolean;
    isDeveloper?: boolean;
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
    impersonatedUserId?: string;
    impersonatedRole?: string;
    impersonatedName?: string;
    impersonatedEmail?: string;
    impersonatedSystemPermissions?: any;
  }
}
