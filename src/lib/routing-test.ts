import { getRoutingConfig, getTenantLink, WORKSPACE_ROUTES } from "./routing";

function testSidebarLinks(pathname: string, tenant: string, hostname: string) {
  console.log(`\n--- Testing for pathname: ${pathname}, tenant: ${tenant}, hostname: ${hostname} ---`);
  
  const navItems = [
    { name: "Overview", href: getTenantLink(WORKSPACE_ROUTES.ADMIN, tenant, pathname, hostname) },
    { name: "Staff & Roles", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_STAFF, tenant, pathname, hostname) },
    { name: "Landing Page", href: getTenantLink(WORKSPACE_ROUTES.ADMIN_SETTINGS, tenant, pathname, hostname) },
  ];

  console.log(navItems);
}

testSidebarLinks("/app/test/admin", "test", "localhost:3000");
testSidebarLinks("/app/test/admin/staff", "test", "localhost:3000");
testSidebarLinks("/admin", "test", "test.localhost:3000");
testSidebarLinks("/admin/staff", "test", "test.localhost:3000");
testSidebarLinks("/app/test/admin", "test", "192.168.1.5:3000");
