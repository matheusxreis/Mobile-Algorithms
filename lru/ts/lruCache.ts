
/* Typescript Implementation With Bytes Size Control */

// LRU - Least Recently Used 

const HashMap = Map;

class Node<T = any>{
    key: string | undefined;
    value: T;
    prev: this | null;
    next: this | null;

    constructor(value:T, key?:string) {
       if(key) this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList<T=any>  {

    head: Node<T> | null;
    tail: Node<T> | null;
    length: number;
    limit: number | null;

   constructor(limit: number | null = null) {
    //
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.limit = limit;
    //
   }
   push(value: Node) {
    // TODO: implement
    // add em ultimo
   }
   pop(rawValue = true): Node<T> | T | undefined | null { 
    // remove o ultimo
        if(!this.head || !this.length) {
            console.error("[DoublyLinkedList] Underflow");
            return;
        }

        const item = this.tail;
        if(item?.prev?.next) { item.prev.next = null }
        this.tail = this.tail?.prev || null;

        this.length--;

        return rawValue ? (item?.value || null): item;
        

   }
    
   unshift(v:T | Node<T>, rawValue = true){
    // add na frente
    const value = rawValue ? new Node<T>(v as T) : v as Node<T>;

    if(this.head) {
        this.head.prev = value;
    }

    value.prev = null;
    value.next = this.head;
    this.head = value;

  
    if(!this.tail) {
        this.tail = this.head;
    }


    this.length++;


   }
   shift(rawValue = true): Node<T> | T | null | undefined {
    // remove da frente
    if(!this.head || !this.length) {
        console.error("[DoublyLinkedList] Underflow");
        return;
    }

    const item = this.head;

    this.head = this.head.next;
    if(this.head) this.head.prev = null;

    this.length--;

    return rawValue ? (item?.value || null) : item
   }

   remove(node:Node<T>) {

        if(node === this.head) {
            this.head = node.next;
        }

        if(node === this.tail) {
            this.tail = node.prev;
        }   

        if(node.prev) {
            node.prev.next = node.next;
        }
        if(node.next) {
            node.next.prev = node.prev;
        }

        node.next = null;
        node.prev = null; 

        this.length--;

        

   }

   print(onlyValue = false, item = this.head, i = this.length) {

    if(i === this.length) {
        console.log("[DoublyLinkedList] is empty")
 
    }
    if(!i || !item) {
        return;
    }

    
    !onlyValue && console.log(`[${this.length-i}]`);
    console.log(onlyValue ? item?.key : item);
    this.print(onlyValue, item.next, i-1);

   }
}



// Least Recently Used

class LRUCache<T = any>{


    static INSTANCE: LRUCache | null = null;

    static getInstance<T = any>(capacity:number) {
        if(!this.INSTANCE) {
            this.INSTANCE = new LRUCache<T>(capacity)
        }

        return this.INSTANCE
    }


    list: DoublyLinkedList<T>;
    map: Map<string, Node<T>>;
    capacity: number;
    bytes: number;

    constructor(capacity: number) {
        this.list = new DoublyLinkedList();
        this.map = new HashMap();
        this.capacity = capacity;
        this.bytes = 0;
    }

    verifyCapacity(bytesToEnter: number) {
        if(bytesToEnter>this.capacity - this.bytes) {
            const lruNode = this.list.pop(false) as Node<T>;
            if(lruNode) {
                this.bytes-= this.verifyBytes(lruNode.value)
                this.map.delete(lruNode.key as string);
            }
        
            this.verifyCapacity(bytesToEnter)
        }
        
    }

    verifyBytes(item:T) {
        const serialized = typeof item === "string" ? item : (JSON.stringify(item));
        return serialized.length//Buffer.byteLength(serialized, 'utf-8')
    }

    put(key:string, value:T) {

        let n = null;

        const bytes = this.verifyBytes(value);

        if(bytes > this.capacity) {
            // return quietly
            return;
        }

        this.verifyCapacity(bytes)

        if(this.map.has(key)) {
            n = this.map.get(key);
            if(n) { 
                n.value = value;
                this.list.remove(n);
            }
        }

        const node = n ? n : new Node(value, key);
        this.list.unshift(node, false);
        this.map.set(key, node);
        this.bytes+=bytes;
    }

    
    get(key:string) {
        if(!this.map.has(key)) {
            return null
        }

        const n = this.map.get(key);

        if(n) {
            this.list.remove(n);
        
            this.list.unshift(n, false);
        
            return n.value;

        }
       return null
    }

}



export { LRUCache };
