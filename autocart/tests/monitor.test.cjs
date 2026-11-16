'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Module=require('node:module');const original=Module._load;Module._load=function(name,...args){if(name==='playwright-core')return {chromium:{}};return original.call(this,name,...args);};const {Monitor,safeUrl}=require('../src/monitor.cjs');Module._load=original;
test('rejects unsafe and invalid product URLs',()=>{
 for(const u of ['http://example.com','file:///etc/passwd','javascript:alert(1)','https://localhost/foo','https://127.0.0.1/','https://user:pass@example.com/','not-a-link'])assert.throws(()=>safeUrl(u));
 assert.equal(safeUrl('https://example.com/products/a'),'https://example.com/products/a');
});
test('stop clears timer and prevents post-stop alerts',async()=>{
 const messages=[];const m=new Monitor('/tmp',(kind,info)=>messages.push([kind,info]));
 m.browser=async()=>({});m.checkOne=async item=>{await new Promise(r=>setTimeout(r,45));return {id:item.id,status:'possible'};};
 await m.start([{id:'1',name:'Toy',url:'https://example.com/p'}],1);
 m.stop();await new Promise(r=>setTimeout(r,85));
 assert.equal(m.started,false);assert.equal(m.timer,null);assert.equal(messages.filter(x=>x[0]==='alert').length,0);
});