require('dotenv').config({ path: '.env' });
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => client.query('SELECT subdomain FROM "Workspace"')).then(res => { console.log(res.rows); client.end(); }).catch(console.error);
