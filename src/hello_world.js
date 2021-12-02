exports.code = `/**
 * NAME: HELLOWORLD
 * DESCRIPTION: SIMPLE HELLO WORLD MODULE
 * AUTHOR: YOUR FABULOUS NAME
 * VERSION: 1.0.9
 * IMMUTABLE: false
 */

// DEFINING COMPILER VERSION
/* BDCash v0.0.1 */

const time = new Date()

async function constructor() {
    
}

function public: eachBlock(block){
    // THIS FUNCTION WILL BE CALLED FOR EACH NEW BLOCK!
    return new Promise(async response => {
        response(block)
    })
}

function public: ifMempool(mempool){
    // THIS FUNCTION WILL BE CALLED IF MEMPOOL IS FULL!
    return new Promise(async response => {
        response(mempool)
    })
}

function public: updatestatus(){
    // WORKING WITH DB IN STATELESS MODE
    return new Promise(async response => {
        let read = await db.read({"address": request.address})

        if(read.length === 0){
            await db.insert({ "address": request.address, score: 0 })
            read = await db.read({"address": request.address})
        }
    
        let increment = read.score + 1
        await db.update({"address": request.address }, { $set: { score: increment } })
        read = await db.read({"address": request.address})
        response(read)
    })
}

function private: inner(){
    return true
}

function public: helloworld(who) {
    return new Promise(async response => {
        if (who !== undefined && who.length > 0) {
            response('Hello ' + who + '! Your address is ' + request.address + '. Now are ' + time + '!')
        } else {
            response('Hello who?')
        }
    })
}`
