import { LRUCache, LIFOCache } from "./lru.js";

const CAPACITY = 100000;
const ITERATIONS = 100000;



// utils;
function populate(storage, param = VALUES.LRU, iterations = ITERATIONS, capacity = CAPACITY){

    for(let i = 0;i<iterations;i++) {
        if(param === VALUES.LRU) {
            storage.put(`id-${i}`, i);
        }else if(param === VALUES.Array) {
            storage.push(`id-${i}`);
            if(storage.length > capacity) { storage.shift() };
        }
    }

}
function getMemory() {
    return (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
}
const VALUES = {
    LRU: 1,
    Map: 2,
    Array: 3,
    LIFO: 4
}
//

function benchmarkSearch(iterations = ITERATIONS, capacity = CAPACITY, param = VALUES.LRU) {

    
    const storage = param === VALUES.LRU ? new LRUCache(capacity) : new Array(capacity);
    populate(storage, param, iterations, capacity);

    const start = performance.now();

    for(let i = 0; i< iterations; i++) {

        if (i % 10 === 0) {
            const randomNumber = Math.floor(Math.random() * iterations);
            const randomKey = `id-${randomNumber}`;

            if(param === VALUES.LRU) {
                storage.get(randomKey, i);
            }else if(param === VALUES.Array) {
                storage.indexOf(randomKey)
            }
        }

    }
    

    const end = performance.now();
    const time = ((end - start)/1000).toFixed(5);

    console.log(`Iterations: ${iterations} and length: ${param === VALUES.LRU ? storage.list.length : storage.length}`)
    console.log(`${param === VALUES.LRU ? "LRU" : "Array"} search time: ${time}s`);


}


function hitRate(iterations = ITERATIONS, capacity = CAPACITY, param = VALUES.LRU) {
    
    let hits = 0;
    let misses = 0;


    const cache =  param === VALUES.LIFO ? new LIFOCache(capacity) : new LRUCache(capacity);
    const totalDbItems = 1000;



    for(let i = 0; i<iterations; i++) {
        let key = "";
        // 80/20
        // 80% das vezes buscando os mesmos 20% itens

       const isHot = Math.random() < 0.8;
        
        if(isHot) {
            /* 
              se 80% das vezes,
              os mesmos itens forem acessados,
              qual sera o hit rating?

              nesse caso é 20%, então espera-se que o cache
              tenha a capacidade de pelo menos 20% do total do db

              caso alterar isso, é necessário alterar a capacidade do cache tb

              se em 80% das vezes, X por cento dos mesmos itens forem acessados, 
              é esperado que o cache suporte pelo menos X por cento do total do banco,

              caso contrário, o hit rating não vai ser tão bom, porque quando atingir 
              o limite, ele vai expulsar alguns desses itens que ainda sim, são frequentemente
              acessados

              se sua cache é muito pequena para o volume de dados, ela acaba sendo inútil
            */


            const from = i < (iterations/2) ? 0 : 500 /** 
            Até metade das iteraçÕes as keys serão de 0 até 20% do banco.
            Depois disso será de 500 até 500 + 20% do banco. 
            Isso é para demonstrar a ineficiencia da LIFO, que irá lotar nas primeiras iteraçÕes
            e como ela remove o item do topo, só vai manter um único item realmente recente, a partir dos 500

            Se quiser que seja diferente de 20%, só mudar o * 0.2 abaixo
            */

            key = `id-${from + Math.floor(Math.random() * ((totalDbItems * 0.2)))}`; 
        } else {
            key = `id-${Math.floor(Math.random() * totalDbItems)}`;
        }

        const item = cache.get(key);

        if(!item) {
            misses++;
            // searching in datasource
            cache.put(key, `valor-from-key-${key}`)
        }else {
            hits++;
        }
    }


    const hitRating = ((hits / iterations) * 100).toFixed(2);
    console.log(`=== HIT RATING ${param === VALUES.LRU ? "LRU" : "LIFO"} ===`)
    console.log(`Database size: ${totalDbItems}\nCapacity: ${capacity}\nIterations: ${iterations}`)
    console.log(`hits: ${hits} & misses ${misses}`)
    console.log(`Hit rating: ${hitRating}%`)

}


async function stressTest(iterations = ITERATIONS, capacity = CAPACITY, param = VALUES.LRU) {
    /* 
       Testing memory control using LRU comparing with Map
       Run with: node --max-old-space-size=512 
    */
    const cache = param === 1 ? new LRUCache(capacity) : new Map();

    for(let i = 0; i<iterations; i++) {

        const heavyObject = {
            id: i,
            data: new Array(100).fill("Woooooooow! Big text!"),
            timestamp: Date.now(),
            json: {
                foo: {
                    bar: {
                       a: "Wow",
                       b: 123,
                       c: true,
                       d: Array(100).fill("Clock, clock, clock!")
                    }
                }
            }
        }

        if(param === 1) {
            cache.put(`key-${i}`, heavyObject)
        }else {
            cache.set(`key-${i}`, heavyObject)
        }

        if(i % 10000 === 0) {
            console.log(`Inseridos: ${i} & memory: ${getMemory()} MB`)          
        }

    }

    console.log(`Final memory: ${getMemory()} MB`)
}

/* 1 billion itens being inserted at LRU Cache 
   Tested with a 512 MB heap
   With LRU: All fine, memory final: 
    85.62 MB usados for 100 itens
    Heavy object added:
       const heavyObject = {
            id: i,
            data: new Array(100).fill("Woooooooow! Big text!"),
            timestamp: Date.now(),
            json: {
                foo: {
                    bar: {
                       a: "Wow",
                       b: 123,
                       c: true,
                       d: Array(100).fill("Clock, clock, clock!")
                    }
                }
            }
        }
   With Map: Heap overflow @.@
*/
// stressTest(1000000000)
// stressTest(1000000000, CAPACITY, VALUES.Map)

// console.log("\n\n")
// hitRate(ITERATIONS, 200, VALUES.LRU);
// console.log("\n\n")
// hitRate(ITERATIONS, 200, VALUES.LIFO);

// benchmarkSearch(ITERATIONS, CAPACITY, VALUES.LRU)
// benchmarkSearch(ITERATIONS, CAPACITY, VALUES.Array)
