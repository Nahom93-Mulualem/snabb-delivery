import { execSync } from 'child_process';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { Client } = pg;

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  console.log('---------------------------------------------------------');
  console.log('   SNABB POSTGRESQL & PRISMA INITIALIZER');
  console.log('---------------------------------------------------------');

  if (!dbUrl || dbUrl.includes('YOUR_POSTGRES_PASSWORD')) {
    console.warn('⚠️ Please set your actual PostgreSQL password in backend/.env:');
    console.warn('   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/snabb"');
    console.warn('   DB_PASSWORD="YOUR_PASSWORD"');
    console.log('---------------------------------------------------------');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl });

  try {
    console.log('🔌 Connecting to PostgreSQL database (snabb)...');
    await client.connect();
    console.log('✅ PostgreSQL connection verified successfully!');
    await client.end();
  } catch (err) {
    console.error('❌ Could not connect to PostgreSQL:', err.message);
    if (err.message.includes('password authentication failed')) {
      console.error('\n💡 HINT: Check the password you set in pgAdmin 4 or during PostgreSQL installation.');
      console.error('Update line 19 & 23 in backend/.env with your password, then re-run this command.');
    } else if (err.message.includes('database "snabb" does not exist')) {
      console.error('\n💡 HINT: Open pgAdmin 4 -> Right click "Databases" -> Create Database -> Name it "snabb".');
    }
    process.exit(1);
  }

  try {
    console.log('\n🚀 Pushing Prisma Schema to PostgreSQL (snabb)...');
    execSync('node ./node_modules/prisma/build/index.js db push --accept-data-loss', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });

    console.log('\n🌱 Populating seed data into PostgreSQL...');
    execSync('node ./prisma/seed.js', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });

    console.log('\n🎉 SUCCESS! Database snabb is completely configured and seeded!');
    console.log('You can now open pgAdmin 4 or run "npx prisma studio" to browse your live tables:');
    console.log('  • users');
    console.log('  • restaurants');
    console.log('  • food_categories');
    console.log('  • menu_items');
    console.log('  • orders & order_items');
    console.log('  • reviews & favorites');
    console.log('---------------------------------------------------------');
  } catch (err) {
    console.error('❌ Error during setup:', err.message);
  }
}

run();
