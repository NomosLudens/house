import {readFile,rm,mkdir,cp} from 'node:fs/promises';
import {validate} from '../public/model.js';
const errors=validate(JSON.parse(await readFile('public/data/estudo.json','utf8')));
if(errors.length)throw Error(errors.join('\n'));
await rm('dist',{recursive:true,force:true});await mkdir('dist/vendor',{recursive:true});await cp('public','dist',{recursive:true});
for(const f of ['leaflet.js','leaflet.css','images'])await cp(`node_modules/leaflet/dist/${f}`,`dist/vendor/${f}`,{recursive:true});
console.log('Build concluído; JSON válido.');
