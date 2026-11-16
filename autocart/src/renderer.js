'use strict';
let state={products:[],maxUnitPrice:15,maxBudget:60,quantityLimit:2,interval:3};let running=false;
const $=id=>document.getElementById(id);
const message=s=>{$('message').textContent=s;};
const controls=['maxUnitPrice','maxBudget','quantityLimit','interval'];
function pull(){for(const k of controls)state[k]=Number($(k).value);}
function put(){for(const k of controls)$(k).value=state[k];}
function make(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function render(){
 const root=$('products');root.replaceChildren();$('count').textContent=state.products.length+' product(s)';
 if(!state.products.length){root.append(make('div','empty','Nothing here yet. Add your first product above.'));return;}
 for(const item of state.products){
  const row=make('div','product'),meta=make('div','meta');
  meta.append(make('strong','',item.name));meta.append(make('small','',item.url));
  const status=make('div','status','Not checked yet');status.id='s-'+item.id;meta.append(status);
  const actions=make('div','actions'),open=make('button','secondary','Open store');
  open.onclick=()=>window.autocart.openProduct(item.url).catch(e=>message(e.message));
  const del=make('button','danger','Remove');del.disabled=running;del.onclick=()=>{state.products=state.products.filter(x=>x.id!==item.id);render();save().catch(e=>message(e.message));};
  actions.append(open,del);row.append(meta,actions);root.append(row);
 }
}
async function save(){pull();state=await window.autocart.save(state);message('Your settings were saved on this computer.');}
$('practice').onclick=()=>window.autocart.practice().catch(e=>message('Could not open practice: '+e.message));
$('add-form').addEventListener('submit',async e=>{
 e.preventDefault();try{
  const url=new URL($('url').value);if(url.protocol!=='https:')throw Error('Use a secure https:// link.');
  state.products.push({id:crypto.randomUUID(),name:$('name').value.trim(),url:url.toString()});
  await save();$('add-form').reset();render();
 }catch(err){state.products.pop();message('Could not add this link: '+err.message);}
});
$('save').onclick=()=>save().catch(e=>message('Check your settings: '+e.message));
$('start').onclick=async()=>{
 try{await save();await window.autocart.start(state);running=true;$('start').disabled=true;$('stop').disabled=false;$('overall').textContent='Watching';$('overall').classList.add('on');render();message('Watching product pages. Keep your computer awake.');}
 catch(e){message('Could not start: '+e.message);}
};
$('stop').onclick=async()=>{await window.autocart.stop();running=false;$('start').disabled=false;$('stop').disabled=true;$('overall').textContent='Not running';$('overall').classList.remove('on');render();message('Monitoring stopped.');};
window.autocart.onEvent(({kind,info})=>{
 if(kind==='error'){message('Error: '+info);return;}
 if(kind==='status'){const s=$('s-'+info.id);if(s){s.className='status '+info.status;s.textContent=({possible:'Possibly available — check store',out:'Appears sold out',unknown:'Availability unclear',error:'Could not check page'})[info.status]+' · '+new Date(info.checkedAt).toLocaleTimeString();}}
 if(kind==='alert'){
  message('🔔 POSSIBLE RESTOCK: '+info.name+' — click "Open store" to verify and purchase.');
  try{const context=new AudioContext(),osc=context.createOscillator(),gain=context.createGain();osc.frequency.value=740;osc.connect(gain);gain.connect(context.destination);gain.gain.value=.06;osc.start();osc.stop(context.currentTime+.25);osc.onended=()=>context.close();}catch{}
 }
});
window.autocart.get().then(s=>{state=s;put();render();}).catch(e=>message('Unable to load saved settings: '+e.message));