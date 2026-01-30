
import sqlite3 from 'sqlite3';
import { LRUCache } from './lru.js';
import { users } from './users.js';



/* LRU Cache + SQLite */

class PersistentCache {

    constructor(dbConnection, capacity) {
        this.db = dbConnection;
        this.lru = new LRUCache(capacity)
    }

    async put(key, value) {

       return await new Promise((resolve, reject) => {
             this.db.run(
            `INSERT OR REPLACE INTO users_cache (username, email) VALUES (?, ?)`, 
            [key, value],
            (err) => {
                if(err) {
                    reject(err)
                }

                // console.log("inserting...")
               this.lru.put(key, value);
                resolve()
 
            })

        })
    }

    async get(key, forceDB = false) {

        return await new Promise((resolve, reject) => {
        const x = this.lru.get(key);

        if(x && !forceDB) {
            // console.log("Returning from LRU Cache");
            resolve(x);
        }else {
            this.db.get("SELECT * FROM users_cache WHERE username = ?", [key],
                (err, row) => {
                    if(err) {
                        reject(err)
                    }
                    // console.log("Finding in the database")
                    if(row) {
                        this.lru.put(key, row.email);
                        resolve(row.email)
                    }else {
                        resolve(null)
                    }
                }
            );
        }
        
    })

    }

}



async function main() {
    /* 
       Using a DB with 456 itens
       and a 25% cache,
       making 228.000 access 
       without LRU cache the result was 7.7 seconds
       with LRU cache the result was 5 seconds

       LRU 10% cache the result was 7 seconds
       LRU 25% cache the result was 5 seconds
       LRU 33% cache the result was 5 seconds
       LRU 50% cache the result was 3.9 seconds
       LRU 75% cache the result was 2 seconds
       LRU 100% cache the result was 0 seconds
    */

    if(!db) {
        return;
    }
    const persistent = new PersistentCache(db, (users.length/4)) // 25% de cache

    await Promise.all(users.map(async u => {
        await persistent.put(u["username"], u["email"]);
    }));

    const start = performance.now();
    for(let i = 0; i < users.length*500; i++) {

        const index = Math.floor(Math.random() * users.length - 1);
        
        if(users[index]) {
            const u = await persistent.get(users[index]["username"], true);
            // console.log(u)
        }

    }
    const end = performance.now();

    console.log(`Seconds to execution: ${((end-start)/1000).toFixed(5)}seg`)

}

const db = new sqlite3.Database('./my_db.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the SQLite database.');
});

db.run(`CREATE TABLE IF NOT EXISTS users_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )`, (err) => {
        if(err) {
            console.error(err)
        }else {
            console.log("Created table...");
            main()
        }
 })


