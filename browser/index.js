'use strict';
/* global window, document, KRPC */
/* eslint-disable no-alert */

window.vesselData = {parts:[]}

var app = new Vue({
          el: '#app',
          data: window.vesselData,
          methods: {
          	triggerEvent: function(module,event,partIndex,moduleIndex){
            	module.krpc.triggerEvent(event);
            	setTimeout(async ()=>{
            	  
            	  var module = vesselData.parts[partIndex].modules[moduleIndex].krpc;
            	
								let moduleName = await module.name;
								let fields = await module.fields
								let actions = await module.actions
								let events = await module.events;
								vesselData.parts[partIndex].modules[moduleIndex] = ({name:moduleName,events:events,actions:actions,fields:fields,krpc:module})
						  },2500)
            	
            },
            triggerAction: function(module,action){
            	module.krpc.setAction(action,true);
            }
          }
        })


const options = {
    name: 'krpc.js-browser',
    host: '184.105.216.122',
    rpcPort: 50000,
    streamPort: 50001
};

if(!window.location.hash) {
    window.location.hash = window.prompt('Please enter the servers IP-address or hostname:', 'localhost');
}
options.host = window.location.hash.slice(1);

let krpc = new KRPC(options);
krpc.load().then(async ()=>{
    let sc = krpc.services.spaceCenter;
    sc.stream('ut');
    let vessel = await sc.activeVessel;
    vessel.stream('situation');
    let bodyRF = await vessel.orbit.then((o)=>o.body).then((body)=>body.referenceFrame);
    let flight = await vessel.flight(bodyRF);
    flight.stream('surfaceAltitude');
    flight.stream('speed');
    let boundingBox = await vessel.boundingBox(await vessel.referenceFrame);
    let parts = await vessel.parts.all;
    
    console.log(parts);
    

    setInterval(async ()=>{
        let time = await sc.ut;
        let altitude = await flight.surfaceAltitude;
        let altitude2 = altitude+boundingBox[0][1];
        let situation = await vessel.situation;
        let speed = await flight.speed;

        document.querySelector("#time").innerText = time;
        document.querySelector("#altitude").innerText = altitude;
        document.querySelector("#altitude2").innerText = altitude2;
        document.querySelector("#situation").innerText = situation;
        document.querySelector("#speed").innerText = speed;
    },10);
    
    setTimeout(async ()=>{


let vessel = await krpc.services.spaceCenter.activeVessel;

let parts = await vessel.parts;
let allParts = await parts.all;
console.log(allParts.length)

vesselData.parts = [];

var badModules = ["USI_ModuleRecycleablePart","TweakScale","ModuleB9PartSwitch","ModuleB9PropagateCopyEvents","ModuleB9PartInfo"]

for(let p in allParts) {
       let title = await allParts[p].title;
       let modules = await allParts[p].modules;
       let resources = await allParts[p].resources;
       let allResources = await resources.all;
       let part = {title:title, modules:[], krpc:allParts[p],resources:[]};
       for(let m in modules) {
         let moduleName = await modules[m].name
         if(moduleName=="KOSNameTag") {continue;}
             let fields = await modules[m].fields
             let actions = await modules[m].actions
             let events = await modules[m].events
         if(Object.keys(fields).length+actions.length+events.length>0) {
             part.modules.push({name:moduleName,events:events,actions:actions,fields:fields,krpc:modules[m]})
         }
       }
       for(let r in allResources) {
         let resourceName = await allResources[r].name
         
             let amount = await allResources[r].amount
             let max = await allResources[r].max
             
         
             part.resources.push({name:resourceName,amount:amount,max:max})
         
       }
       vesselData.parts.push(part);
}







},10)


    
    
}).catch((e)=>console.error('Error connecting to Vessel:',e));

