// One-time script: copies every collection (and its documents + indexes)
// from the old "gratojalebi" database to a new "cheesycrust" database on
// the SAME Atlas cluster. Uses the credentials already in your .env file.
//
// The old "gratojalebi" database is left untouched — nothing is deleted.
// Run this once, confirm the counts match, then the app can be pointed at
// "cheesycrust" (see the printed instructions at the end).
//
// Usage:
//   cd backend
//   node migrate-db-name.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

const OLD_DB_NAME = 'gratojalebi';
const NEW_DB_NAME = 'cheesycrust';

// Reuse the same connection string from .env, just swap the db name in it.
const rawUri = process.env.MONGODB_URI;
if (!rawUri) {
  console.error('MONGODB_URI not found in .env');
  process.exit(1);
}
const baseUri = rawUri.replace(`/${OLD_DB_NAME}?`, '/?');

(async () => {
  const client = new MongoClient(baseUri, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    const oldDb = client.db(OLD_DB_NAME);
    const newDb = client.db(NEW_DB_NAME);

    const collections = await oldDb.listCollections().toArray();
    if (collections.length === 0) {
      console.log(`No collections found in "${OLD_DB_NAME}" — nothing to migrate.`);
      return;
    }

    console.log(`Migrating ${collections.length} collection(s) from "${OLD_DB_NAME}" to "${NEW_DB_NAME}"...\n`);

    for (const { name } of collections) {
      const oldCol = oldDb.collection(name);
      const newCol = newDb.collection(name);

      const docs = await oldCol.find({}).toArray();
      if (docs.length > 0) {
        // insertMany in batches to be safe with large collections
        const BATCH = 500;
        for (let i = 0; i < docs.length; i += BATCH) {
          await newCol.insertMany(docs.slice(i, i + BATCH), { ordered: false });
        }
      }

      // Recreate indexes (skip the default _id index, Mongo makes that automatically)
      const indexes = await oldCol.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const { key, name: idxName, ...options } = idx;
        try {
          await newCol.createIndex(key, { name: idxName, ...options });
        } catch (e) {
          console.warn(`  (index "${idxName}" on "${name}" skipped: ${e.message})`);
        }
      }

      const oldCount = await oldCol.countDocuments();
      const newCount = await newCol.countDocuments();
      const ok = oldCount === newCount ? 'OK' : 'MISMATCH';
      console.log(`  ${name}: ${oldCount} -> ${newCount}  [${ok}]`);
    }

    console.log(`\nDone. "${OLD_DB_NAME}" was not modified or deleted.`);
    console.log(`\nNext step — update backend/.env, change:`);
    console.log(`  /${OLD_DB_NAME}?ssl=true`);
    console.log(`to:`);
    console.log(`  /${NEW_DB_NAME}?ssl=true`);
    console.log(`\nthen restart the backend server.`);
  } catch (e) {
    console.error('Migration error:', e.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
