import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);
sql`SELECT subdomain FROM "Workspace"`.then(rows => {
  console.log(rows);
}).catch(console.error);
