
// LIFO

class LIFOCache {

    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();
        this.stack = [];
    }

    get(key) {
        return (this.map.get(key) || null)
    }

    put(key, value) {

        if (this.map.has(key)) {

            this.map.set(key, value);
            return;

        }

        if(this.map.size >= this.capacity) {

           const keyRemoved = this.stack.pop();
           this.map.delete(keyRemoved);
        }

        this.stack.push(key);
        this.map.set(key, value);
        
    }
}



// LRU - Least Recently Used 

const HashMap = Map;

class Node {
    constructor(value, key) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class DoublyLinkedList  {

   constructor(limit = null) {
    //
    this.head = null;
    this.tail = null;
    this.length = 0;
    this.limit = limit;
    //
   }
   push(value) {
    // TODO: implement
    // add em ultimo
   }
   pop(rawValue = true) {
    // remove o ultimo
        if(!this.head || !this.length) {
            console.error("[DoublyLinkedList] Underflow");
            return;
        }

        const item = this.tail;
        if(item?.prev?.next) { item.prev.next = null }
        this.tail = this.tail.prev;

        this.length--;

        return rawValue ? (item?.value || null): item;
        

   }
    
   unshift(v, rawValue = true){
    // add na frente
    const value = rawValue ? new Node(v) : v;

    if(this.head) {
        this.head.prev = value;
    }

    value.prev = null;
    value.next = this.head;
    this.head = value;

  
    if(!this.tail) {
        this.tail = this.head;
    }

    // if(this.limit !== null && this.length+1>this.limit) {
    //     //
    //     this.tail = this.tail.prev;
    //     this.tail.next = null;

    //     return;
    //     //
    // }

    this.length++;


   }
   shift(rawValue = true) {
    // remove da frente
    if(!this.head || !this.length) {
        console.error("[DoublyLinkedList] Underflow");
        return;
    }

    const item = this.head;

    this.head = this.head.next;
    this.head.prev = null;

    this.length--;

    return rawValue ? (item?.value || null) : item
   }

   remove(node) {

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

const map = new HashMap();
const list = new DoublyLinkedList(10);

// Least Recently Used

class LRUCache {

    constructor(capacity) {
        this.list = new DoublyLinkedList();
        this.map = new HashMap();
        this.capacity = capacity;
    }

    verifyCapacity() {
        if(this.list.length>this.capacity) {
            const lruNode = this.list.pop(false);
            this.map.delete(lruNode.key)
        }
        
    }
    put(key, value) {

        let n = null;

        if(this.map.has(key)) {
            n = this.map.get(key);
            n.value = value;
            this.list.remove(n);
        }

        const node = n ? n : new Node(value, key);
        this.list.unshift(node, false);
        this.map.set(key, node);

       this.verifyCapacity()
        
    }

    
    get(key) {
        if(!this.map.has(key)) {
            return null
        }

        const n = this.map.get(key);

        this.list.remove(n);
    
        this.list.unshift(n, false);


        // this.verifyCapacity();

        return n.value;
    }

}



export { LIFOCache, LRUCache }