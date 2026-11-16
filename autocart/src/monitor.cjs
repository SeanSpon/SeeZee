'use strict';
const {chromium}=require('playwright-core');
const fs=require('fs'),path=require('path');
function findBrowser(){
 const roots=[process.env.PROGRAMFILES,process.env['PROGRAMFILES(X86)'],process.env.LOCALAPPDATA].filter(Boolean);
 const rels=['Google/Chrome/Application/chrome.exe','Microsoft/Edge/Application/msedge.exe','BraveSoftware/Brave-Browser/Application/brave.exe'];
 for(const root of roots)for(const rel of rels){const p=path.join(root,...rel.split('/'));if(fs.existsSync(p))return p;}
 return null;
}
function safeUrl(value){
 const u=new URL(value);
 if(u.protocol!=='https:'||!u.hostname.includes('.')||u.username||u.password)throw Error('Use a normal https:// product link.');
 if(['localhost','127.0.0.1','0.0.0.0'].includes(u.hostname)||u.hostname.endsWith('.local'))throw Error('Local URLs not allowed.');
 return u.toString();
}
class Monitor{
 constructor(userDataDir,emit){this.dir=path.join(userDataDir,'shopping-browser');this.emit=emit;this.context=null;this.timer=null;this.started=false;this.busy=false;this.products=[];this.previous=new Map();this.activePages=new Set();this.generation=0;}
 async browser(){
  if(this.context)return this.context;
  const executablePath=findBrowser();
  if(!executablePath)throw Error('Install Chrome or Edge first.');
  this.context=await chromium.launchPersistentContext(this.dir,{executablePath,headless:false,viewport:{width:1100,height:850},args:['--no-first-run'],acceptDownloads:false});
  this.context.on('close',()=>{this.context=null;this.stop();});
  return this.context;
 }
 async open(url){const ctx=await this.browser();const page=await ctx.newPage();await page.goto(safeUrl(url),{waitUntil:'domcontentloaded',timeout:25000}).catch(()=>{});await page.bringToFront();}
 async checkOne(item){
  const ctx=await this.browser();let page;
  try{
   page=await ctx.newPage();this.activePages.add(page);
   await page.goto(safeUrl(item.url),{waitUntil:'domcontentloaded',timeout:20000});
   await page.waitForTimeout(1300);
   const signal=await page.evaluate(()=>{
    const content=(document.body?.innerText||'').slice(0,80000).toLowerCase();
    const labels=Array.from(document.querySelectorAll('button,input[type=submit],[role=button]')).map(el=>({text:(el.innerText||el.value||el.getAttribute('aria-label')||'').trim().toLowerCase().slice(0,120),disabled:el.disabled||el.getAttribute('aria-disabled')==='true'}));
    return {available:labels.some(x=>/^(add to (bag|cart)|buy now|add to basket)(\b|$)/.test(x.text)&&!x.disabled),unavailable:labels.some(x=>/(sold out|out of stock|unavailable)/.test(x.text))||/\b(currently unavailable|temporarily out of stock|sold out)\b/.test(content),title:document.title.slice(0,160)};
   });
   const status=signal.available&&!signal.unavailable?'possible':signal.unavailable&&!signal.available?'out':'unknown';
   return {id:item.id,status,detail:signal.title,checkedAt:Date.now()};
  }catch(err){return {id:item.id,status:'error',detail:String(err.message).slice(0,150),checkedAt:Date.now()};}
  finally{if(page){this.activePages.delete(page);if(!page.isClosed())await page.close().catch(()=>{});}}
 }
 async tick(){
  if(!this.started||this.busy)return;this.busy=true;const generation=this.generation;
  try{for(const item of this.products){if(!this.started||generation!==this.generation)break;const res=await this.checkOne(item);if(!this.started||generation!==this.generation)break;const prior=this.previous.get(item.id);this.previous.set(item.id,res.status);this.emit('status',res);if(res.status==='possible'&&prior!=='possible')this.emit('alert',{...res,name:item.name,url:item.url});}}
  finally{this.busy=false;}
 }
 async start(products,minutes=3){
  if(this.started)this.stop();
  if(!Array.isArray(products)||!products.length)throw Error('Add a product first.');
  for(const p of products)safeUrl(p.url);
  await this.browser();this.products=products.map(p=>({...p}));this.started=true;
  this.timer=setInterval(()=>this.tick().catch(e=>this.emit('error',e.message)),Math.max(1,Math.min(60,minutes))*60000);
  this.tick().catch(e=>this.emit('error',e.message));return true;
 }
 stop(){this.started=false;this.generation++;if(this.timer)clearInterval(this.timer);this.timer=null;for(const page of this.activePages){page.close().catch(()=>{});}this.activePages.clear();}
 async shutdown(){this.stop();if(this.context)await this.context.close().catch(()=>{});this.context=null;}
}
module.exports={Monitor,safeUrl};