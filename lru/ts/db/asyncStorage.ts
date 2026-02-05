/* Async Storage Persistent with LRU Caching 
   to use in React Native to save small data

   You can use to save:
   { [remote-url-image]: [file-system-url] }
    or
    another small thing
*/

import { LRUCache } from "../lruCache";
import { IPersistentCache } from "./db";

import AsyncStorage from "@react-native-async-storage/async-storage";


const CACHE_AMOUT = 512 * 1000 * 1000; // 512 MB

class AsyncStoragePersistentCache<T=any> implements IPersistentCache<T> {


    static INSTANCE: AsyncStoragePersistentCache | null = null;

    static getInstance(capacity?: number) {
        if(!this.INSTANCE) {
            this.INSTANCE = new AsyncStoragePersistentCache(capacity || CACHE_AMOUT);
        }
        return this.INSTANCE;
    }


    cache: LRUCache<T>; 

    constructor(capacity: number) {
        this.cache = new LRUCache(capacity)
    }
    
    
    async put(key: string, value: T): Promise<void> {

        this.cache.put(key, value);
        await AsyncStorage.setItem(key, JSON.stringify(value));
    
    }

    async get(key: string): Promise<T|null> {

        const item = this.cache.get(key);

        if(!item) {
           const strItem = await AsyncStorage.getItem(key);

           if(strItem) {
            const data = JSON.parse(strItem);
            this.cache.put(key, data);
            return data;
           }
           return null;

        }

        console.log("HIT!!!!!");
        return item;
        

    }

    getSync(key:string): T|null {
        return this.cache.get(key)
    }

    

}

export { AsyncStoragePersistentCache };
