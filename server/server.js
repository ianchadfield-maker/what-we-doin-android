const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, 'public')));
const rooms = new Map();
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function code(){let s;do{s=Array.from({length:6},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('')}while(rooms.has(s));return s}
function publicRoom(room){return {code:room.code,items:room.items,people:[...room.people.values()],spin:room.spin,vote:room.vote?{itemId:room.vote.itemId,eligible:[...room.vote.eligible],votes:Object.fromEntries(room.vote.votes)}:null,accepted:room.accepted,notice:room.notice}}
function broadcast(room){io.to(room.code).emit('room',publicRoom(room))}
function safeName(v,max=36){return String(v||'').trim().replace(/[<>]/g,'').slice(0,max)}
function error(ack,message){if(typeof ack==='function')ack({ok:false,error:message})}
function startSpin(room){
 const available=room.items.filter(x=>!room.rejected.has(x.id));
 if(!available.length){room.spin=null;room.vote=null;room.notice='No activities got a majority yes. Add more ideas or start a new round!';broadcast(room);return}
 const totalWeight=available.reduce((sum,x)=>sum+x.weight,0);
 if(totalWeight<=0){room.spin=null;room.vote=null;room.notice='All remaining ideas are set to 0%. Raise at least one chance to spin.';broadcast(room);return}
 let pick=crypto.randomInt(totalWeight);const winner=available.find(x=>(pick-=x.weight)<0);
 const winnerIndex=available.findIndex(x=>x.id===winner.id);
 const start=Date.now();room.vote=null;room.accepted=null;room.notice=null;
 room.spin={id:crypto.randomUUID(),winnerId:winner.id,winnerIndex,items:available.map(x=>({...x})),startedAt:start+350,endsAt:start+6350,turns:6+crypto.randomInt(3)};
 broadcast(room);
 setTimeout(()=>{if(room.spin?.winnerId!==winner.id||room.vote||room.accepted)return;
  room.vote={itemId:winner.id,eligible:new Set(room.people.keys()),votes:new Map()};broadcast(room);checkVotes(room);
 },6350);
}
function checkVotes(room){const v=room.vote;if(!v)return;
 const total=v.eligible.size,yes=[...v.votes.values()].filter(Boolean).length;
 if(yes>total/2){room.accepted=room.items.find(x=>x.id===v.itemId)?.label||'Activity';room.vote=null;room.rejected.clear();room.notice=null;broadcast(room);return}
 if(v.votes.size===total){room.rejected.add(v.itemId);room.vote=null;room.notice='Not enough yes votes — spinning again!';broadcast(room);setTimeout(()=>{if(!room.vote&&!room.accepted)startSpin(room)},1100)}
}
io.on('connection',socket=>{
 socket.on('join',({roomCode,name},ack)=>{
  name=safeName(name,24)||'Friend';roomCode=safeName(roomCode,6).toUpperCase();
  let room;if(!roomCode){roomCode=code();room={code:roomCode,items:[],people:new Map(),spin:null,vote:null,accepted:null,notice:null,rejected:new Set(),created:Date.now()};rooms.set(roomCode,room)}else{room=rooms.get(roomCode);if(!room)return error(ack,'Room not found. Check the code.');}
  if(socket.data.room){const old=rooms.get(socket.data.room);if(old){old.people.delete(socket.id);socket.leave(old.code);broadcast(old)}}
  socket.data.room=roomCode;socket.data.name=name;room.people.set(socket.id,{id:socket.id,name});socket.join(roomCode);ack?.({ok:true,code:roomCode});broadcast(room);
 });
 socket.on('add',(value,ack)=>{const room=rooms.get(socket.data.room);if(!room)return error(ack,'Join a room first.');const label=safeName(value,70);if(!label)return error(ack,'Enter an activity.');if(room.items.length>=60)return error(ack,'The wheel is full (60 ideas).');if(room.vote||room.accepted||room.spin&&Date.now()<room.spin.endsAt)return error(ack,'Wait until this round finishes.');room.items.push({id:crypto.randomUUID(),label,by:socket.data.name,ownerId:socket.id,weight:100});ack?.({ok:true});broadcast(room)});
 socket.on('weight',({id,weight},ack)=>{const room=rooms.get(socket.data.room);if(!room)return error(ack,'Join a room first.');if(room.vote||room.spin&&Date.now()<room.spin.endsAt)return error(ack,'Wait for the current spin or vote to finish.');const item=room.items.find(x=>x.id===id);if(!item)return error(ack,'Idea not found.');if(item.ownerId!==socket.id)return error(ack,'Only the person who added this idea can change its chance.');if(!Number.isInteger(weight)||weight<0||weight>100)return error(ack,'Chance must be from 0 to 100.');item.weight=weight;ack?.({ok:true});broadcast(room)});
 socket.on('remove',(id,ack)=>{const room=rooms.get(socket.data.room);if(!room)return error(ack,'Join a room first.');if(room.vote||room.accepted||room.spin&&Date.now()<room.spin.endsAt)return error(ack,'Wait until this round finishes.');room.items=room.items.filter(i=>i.id!==id);ack?.({ok:true});broadcast(room)});
 socket.on('spin',(_,ack)=>{const room=rooms.get(socket.data.room);if(!room)return error(ack,'Join a room first.');if(room.vote||room.spin&&Date.now()<room.spin.endsAt)return error(ack,'Round in progress!');if(room.items.length<2)return error(ack,'Add at least two ideas first.');room.rejected.clear();startSpin(room);ack?.({ok:true})});
 socket.on('vote',({yes},ack)=>{const room=rooms.get(socket.data.room);const v=room?.vote;if(!v||!v.eligible.has(socket.id))return error(ack,'Voting is not open for you.');if(v.votes.has(socket.id))return error(ack,'You already voted.');if(typeof yes!=='boolean')return error(ack,'Invalid vote.');v.votes.set(socket.id,yes);ack?.({ok:true});broadcast(room);checkVotes(room)});
 socket.on('disconnect',()=>{const room=rooms.get(socket.data.room);if(room){room.people.delete(socket.id);if(room.vote){room.vote.eligible.delete(socket.id);room.vote.votes.delete(socket.id);broadcast(room);checkVotes(room)}else broadcast(room)}});
});
setInterval(()=>{for(const [id,room] of rooms){if(room.people.size===0&&Date.now()-room.created>24*60*60*1000)rooms.delete(id)}},60*60*1000).unref();
server.listen(process.env.PORT||3000,()=>console.log('What We Doin? running on port '+(process.env.PORT||3000)));
