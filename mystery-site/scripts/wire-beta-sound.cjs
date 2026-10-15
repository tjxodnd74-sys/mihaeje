const fs=require('node:fs');const file='web/escape-kit.js';let s=fs.readFileSync(file,'utf8');
const edits=[
 ["s.inventory.push('exit-key');dirty=true","s.inventory.push('exit-key');window.MihaejeAudio?.play('keys');dirty=true"],
 ["s.area=1-s.area;this.panel=null;window.MihaejeAudio?.play('door');","s.area=1-s.area;this.panel=null;window.MihaejeAudio?.play(s.area===0?'doorClose':'door');"],
 ["s.revealed=true;this.panel='clue';this.message=this.theme.reveal;window.MihaejeAudio?.play('unlock');","s.revealed=true;this.panel='clue';this.message=this.theme.reveal;window.MihaejeAudio?.play(this.config.id==='laundry'?'lock':['radio','station','letter','pet-home','cat-invite'].includes(this.config.id)?'paper':'unlock');"],
 ["s.choice[i]=t.tokens[(t.tokens.indexOf(s.choice[i])+1)%t.tokens.length];this.config.save();","s.choice[i]=t.tokens[(t.tokens.indexOf(s.choice[i])+1)%t.tokens.length];window.MihaejeAudio?.play(s.choice[i]==='아래'?'switchOff':'switchOn');this.config.save();"]
];for(const [a,b]of edits){if(!s.includes(a))throw Error('Missing audio action');s=s.replace(a,b)}fs.writeFileSync(file,s);console.log('Physical actions use recorded opening/closing, keys and switch sounds');
