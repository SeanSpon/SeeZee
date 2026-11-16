'use strict';
const {app,BrowserWindow,ipcMain}=require('electron');
const fs=require('fs'),path=require('path');
const {Monitor,safeUrl}=require('./monitor.cjs');
let win,monitor;
const defaults={products:[],maxUnitPrice:15,maxBudget:60,quantityLimit:2,interval:3};
const settingsPath=()=>path.join(app.getPath('userData'),'settings.json');
function load(){try{return {...defaults,...JSON.parse(fs.readFileSync(settingsPath(),'utf8'))};}catch{return {...defaults};}}
function validate(v){
 if(!v||!Array.isArray(v.products)||v.products.length>100)throw Error('Invalid product list.');
 const products=v.products.map(p=>({id:String(p.id).slice(0,60),name:String(p.name||'Product').slice(0,100),url:safeUrl(p.url)}));
 const num=(x,min,max)=>{let n=Number(x);if(!Number.isFinite(n)||n<min||n>max)throw Error('Please check your limits.');return n;};
 return {products,maxUnitPrice:num(v.maxUnitPrice,0,100000),maxBudget:num(v.maxBudget,0,100000),quantityLimit:num(v.quantityLimit,1,100),interval:num(v.interval,1,60)};
}
function emit(kind,info){if(win&&!win.isDestroyed())win.webContents.send('watch-event',{kind,info});}
app.whenReady().then(()=>{
 monitor=new Monitor(app.getPath('userData'),emit);
 ipcMain.handle('get-settings',()=>load());
 ipcMain.handle('save-settings',(_e,v)=>{const s=validate(v);fs.writeFileSync(settingsPath(),JSON.stringify(s,null,2),{mode:0o600});return s;});
 ipcMain.handle('start',async(_e,v)=>{const s=validate(v);await monitor.start(s.products,s.interval);return true;});
 ipcMain.handle('stop',()=>{monitor.stop();return true;});
 ipcMain.handle('practice',()=>{const demo=new BrowserWindow({width:1150,height:860,minWidth:800,minHeight:650,title:'AutoCart — Practice Mode',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});demo.loadFile(path.join(__dirname,'practice.html'));demo.webContents.setWindowOpenHandler(()=>({action:'deny'}));demo.webContents.on('will-navigate',e=>e.preventDefault());return true;});
 ipcMain.handle('open-product',async(_e,url)=>monitor.open(url));
 win=new BrowserWindow({width:1100,height:790,minWidth:770,minHeight:600,backgroundColor:'#0e1422',title:'AutoCart by SeeZee',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 win.loadFile(path.join(__dirname,'index.html'));
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
});
app.on('before-quit',()=>{if(monitor)monitor.stop();});
app.on('window-all-closed',()=>app.quit());