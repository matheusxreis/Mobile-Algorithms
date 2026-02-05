

/* Persistence Cache, using the disk, but storing an amount in the RAM to rapid access  */
export interface IPersistentCache<T> {
    put: (key:string, value: T) => Promise<void>
    get: (key:string) => Promise<T|null>
    getSync:(key:string) => T|null
}

