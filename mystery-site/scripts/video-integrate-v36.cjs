const fs=require('node:fs');
const p='web/app.js';let s=fs.readFileSync(p,'utf8');
s=s.replace('data-seek="2.7">입장 장면','data-seek="0">입장 장면').replace('data-seek="8.7">퇴장 장면','id="exitClipRecord">퇴장 기록');
s=s.replace('가상 사건 재현 · 입장/퇴장 각 6초 발췌 · 중간 1분 54초 생략 · 무음','가상 사건 재현 · 출입문 확대 / 입장 약 4초 발췌 · 퇴장은 아래 관찰 기록으로 확인 · 무음');
s=s.replace('fetch("assets/dashcam.webm"','fetch("assets/dashcam-v36.mp4"');
s=s.replace(' $("#frameStep").onclick=', ' $("#exitClipRecord").onclick=()=>{v.pause();pending=null;status.textContent="퇴장 관찰 기록 · 21:55:20 같은 인물이 출입문으로 나와 문을 닫았습니다 이 발췌 영상에는 퇴장 장면이 포함되지 않습니다"};\n $("#frameStep").onclick=');
fs.writeFileSync(p,s);
const a='web/adventure-data.js';fs.writeFileSync(a,fs.readFileSync(a,'utf8').replace('낯선 분류 도장 R·17·04','낯선 분류 도장 M·R·17·04'));
fs.writeFileSync('design/dashcam-v36-review.json',JSON.stringify({date:'2026-10-10',model:'seedance1_5',jobs:[{id:'0275b635-30df-46c3-a08a-d8236b48b655',estimatedCredits:9.6,status:'completed',used:false,reason:'incorrect reference scene'},{id:'e36f2ea8-951c-4845-8f83-3807a44bbd27',estimatedCredits:4.8,status:'failed',used:false},{id:'d89b4555-f148-4be4-8151-64ec3ebc30fc',estimatedCredits:4.8,status:'completed',used:true}],estimatedAttemptTotal:19.2,actualBilling:'not verified; failed job refund not verified',visualInspectionSeconds:[1,2,3],duration:4.042,bytes:269370,asset:'assets/dashcam-v36.mp4',scope:'entry only; departure remains explicitly labeled written observation',processing:'door crop removes static source artifact and generated corrupt timestamp; own fictional entry label; mute H264 faststart',source:'user attachment c63f0ec5-97bd-4a56-8a80-3a4cc911505c, resized for model input'},null,2));
