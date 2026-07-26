const { neon } = require('@neondatabase/serverless');

async function main() {
  const sql = neon("postgresql://neondb_owner:npg_ZT6Y0BDHsUCi@ep-soft-dust-ao5wgp20-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
  const rows = await sql`SELECT id, subdomain, "isActive" FROM "Workspace" WHERE subdomain = 'example'`;
  console.log("Workspace example:", rows);
}

main();
