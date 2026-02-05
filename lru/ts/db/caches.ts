import { LRUCache } from "../lruCache";

/** example how to use only LRU */
const titleCache = LRUCache.getInstance<string>(1 * 1000 * 1000 /* 1 MB */)