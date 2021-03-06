# krpc.js
See ./browser for a browserified version
See ./lib for nodejs

## Example
```javascript
const KRPC = require('.'); // only needed for node

const options = {
    name: 'krpc.js',    // (default)
    host: 'localhost',  // (default)
    rpcPort: 50000,     // (default)
    streamPort: 50001,  // (default)
    streamRate: 20      //hz (default: 0 = unlimited)
};

let krpc = new KRPC(options);


krpc.load().then(async ()=>{
    let sc = krpc.services.spaceCenter;
    let vessel = await sc.activeVessel; // awaiting rpc call
    for (let i = 0; i<10; i++) {
        console.log(await vessel.situtation); // slow, one rpc is executed every time
    }

    vessel.stream('situation');
    for (let i = 0; i<10; i++) {
        console.log(await vessel.situtation); // fast, streamed properties can be resolved immediately
    }
    
    //yet another way:
    let stream = vessel.stream('situation', (situation)=>console.log(situation));
    window.setTimeout(()=>stream.remove(), 60*1000);
}.catch(console.error)
```
