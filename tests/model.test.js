import test from 'node:test';
import assert from 'node:assert/strict';
import {validate,select,costs,stale} from '../public/model.js';
export const listing=(overrides={})=>({id:'test-only',title:'FIXTURE SINTÉTICA — NÃO É ANÚNCIO',city:'Pindamonhangaba',neighborhood:'Mombaça',bedrooms:2,status:'active',verified:true,verifiedAt:new Date().toISOString(),url:'https://example.org/test-only',costs:{rent:1000,condo:100,iptu:50},scenarios:Array.from({length:5},(_,i)=>({fuel:100+i*10,source:'Fixture de teste; valores sintéticos'})),coordinates:[-22.92,-45.46],...overrides});
export const dataset=(listings=[])=>({version:1,updatedAt:new Date().toISOString(),listings,observations:[]});
test('contrato aceita publicação vazia e rejeita custos, links e IDs inválidos',()=>{
 assert.deepEqual(validate(dataset()),[]);
 for(const p of [listing({costs:{rent:-1,condo:0,iptu:0}}),listing({url:'javascript:alert(1)'}),listing({scenarios:[]}),listing({verifiedAt:null}),listing({coordinates:[91,0]})])assert.ok(validate(dataset([p])).length);
 assert.ok(validate(dataset([listing(),listing()])).length);
});
test('somente ativos verificados recentes entram no ranking',()=>{
 const good=listing();const d=dataset([good,listing({id:'old',verifiedAt:'2020-01-01T00:00:00Z'}),listing({id:'off',status:'inactive'}),listing({id:'unknown',verified:false})]);
 assert.deepEqual(select(d).map(p=>p.id),[good.id]);assert.equal(stale(null),true);
});
test('filtros abrangem qualquer bairro e quartos; cinco cenários alteram total',()=>{
 const p=listing(), d=dataset([p,listing({id:'other',neighborhood:'Outro bairro',bedrooms:3})]);
 assert.equal(select(d,{bedrooms:'3',neighborhood:'Outro bairro'}).length,1);
 assert.equal(select(d,{bedrooms:'2',neighborhood:'Outro bairro'}).length,0);
 assert.deepEqual([0,1,2,3,4].map(i=>costs(p,i).known),[1250,1260,1270,1280,1290]);
});
test('desconhecido não é total completo; completos vêm antes dos parciais',()=>{
 const partial=listing({id:'partial',costs:{rent:500,condo:null,iptu:0}}),complete=listing();
 assert.equal(costs(partial,0).complete,false);
 assert.deepEqual(select(dataset([partial,complete])).map(p=>p.id),[complete.id,partial.id]);
});
