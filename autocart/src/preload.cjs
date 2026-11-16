'use strict';
const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('autocart',{
 get:()=>ipcRenderer.invoke('get-settings'),
 save:v=>ipcRenderer.invoke('save-settings',v),
 start:v=>ipcRenderer.invoke('start',v),
 stop:()=>ipcRenderer.invoke('stop'),
 openProduct:url=>ipcRenderer.invoke('open-product',url),
 practice:()=>ipcRenderer.invoke('practice'),
 onEvent:handler=>ipcRenderer.on('watch-event',(_e,data)=>handler(data))
});