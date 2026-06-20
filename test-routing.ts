import { getTenantLink, getRoutingConfig } from './src/lib/routing';

console.log("Subdir mode (localhost):");
console.log(getRoutingConfig("/app/wb-002/admin", "localhost:3000", "wb-002"));
console.log(getTenantLink("/admin/wallet", "wb-002", "/app/wb-002/admin", "localhost:3000"));

console.log("\nSubdir mode (SSR):");
console.log(getRoutingConfig("/app/wb-002/admin", undefined, "wb-002"));
console.log(getTenantLink("/admin/wallet", "wb-002", "/app/wb-002/admin", undefined));

console.log("\nSubdomain mode (wb-002.localhost):");
console.log(getRoutingConfig("/admin", "wb-002.localhost:3000", "wb-002"));
console.log(getTenantLink("/admin/wallet", "wb-002", "/admin", "wb-002.localhost:3000"));
