/*  File System Persistent with LRU Caching
    This implementation uses the LRU Caching from 
    AsyncStoragePersistentCache implemented here.

    AsyncStorage saves:
    { [remote-url-image]: [file-system-url] }

    Case remote url already have been downloaded, it will not be again. 
    The local path is saved in the disk and also some them in the RAM.

    This way the network latency is eliminated & the search by the file system uri
    in the disk eventually too. The next step would be a bitmap cache with a bitmap pool
    to not have to search the uri in Android Page Caching, but React Native doesnt support Bitmaps.

    the idea:

    save: 
    [NETWORK] ------> [SAVE IN THE DISK AND KEEP THE URL MAPPED WITH URI (DISK CACHE)] -> [ADD IN RAM CACHE (RAM CACHE)]
    search:
    [URI IN RAM CACHE] ----> [CASE NOT IN THE RAM, SEARCH THE MAPPED URI IN THE DISK (DISK CACHE)] -> [ANDROID PAGE CACHING]
    ---------> [CASE NOT IN DISK, SAVE]

    Mapping the remote url with local uri keeps this simplest to handle. The disk caching is very useful in instable network case,
    and the ram uri caching is useful in big lists, to avoid multiple disk access, but with a bitmap cache it would be perfect.

*/

import { Image } from "react-native";
import { AsyncStoragePersistentCache } from "./asyncStorage";
import { IPersistentCache } from "./db";

import * as FS from "expo-file-system";

const CACHE_AMOUT = 512 * 1000 * 1000; // 512 MB

class FileSystemPersistentCache<T=string> implements IPersistentCache<T> {

     static INSTANCE: FileSystemPersistentCache<string> | null = null;

    static getInstance(capacity?: number) {
        if(!this.INSTANCE) {
            this.INSTANCE = new FileSystemPersistentCache(capacity || CACHE_AMOUT);
        }
        return this.INSTANCE;
    }

    storage: AsyncStoragePersistentCache;

    constructor(capacity: number) {
         this.storage = new AsyncStoragePersistentCache(capacity/2);
    }

    async put (key: string, value?: T): Promise<void> {
       
       if(!this.getSync(key)) {
        // in this case not update the value, keep the same
      
        const destination = new FS.Directory(FS.Paths.document, 'images');  
       
        if(!destination.exists) {
            destination.create();
        }
 
        const output = await FS.File.downloadFileAsync(key as string, destination, {idempotent: true});
        if(output.uri) {
            Image.prefetch(output.uri)
        }
        await this.storage.put(key, output.uri);
       }
    }

    async get (key: string): Promise<T | null> {

        const item = this.storage.getSync(key);

        if(item) {
            return item;
        }
       return (await this.storage.get(key));

    }


    getSync (key: string): T | null {
        return this.storage.getSync(key)
    }

}



export { FileSystemPersistentCache };
