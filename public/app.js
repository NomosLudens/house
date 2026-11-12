import {scenarios,priority,validate,select,costs,stale} from './model.js';
const $=id=>document.getElementById(id);
const fmt=v=>v===null?'Não informado':v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const element=(tag,text,cls)=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
scenarios.forEach((s,i)=>$('scenario').add(new Option(`${i+1}. ${s}`,i)));
let data,map,markers;
function render(){
 const scenario=Number($('scenario').value), rows=select(data,{bedrooms:$('bedrooms').value,neighborhood:$('neighborhood').value,scenario});
 $('listings').replaceChildren();$('count').textContent=`${String(rows.length).padStart(2,'0')} IMÓVEIS`;
 if(!rows.length){const box=element('div','','empty');box.append(element('b','Espaço para uma boa escolha.'),element('p',data.listings.length?'Nenhum imóvel elegível para estes filtros. Ajuste a seleção ou confira os itens fora do ranking.':'Ainda não há anúncios individualmente verificados publicados. Quando a planilha for validada, os imóveis e seus custos aparecerão aqui.'));$('listings').append(box);}
 rows.forEach((p,i)=>{const card=element('article','','card'),c=costs(p,scenario);card.append(element('span',`${String(i+1).padStart(2,'0')} / ${p.neighborhood}${priority.includes(p.neighborhood)?' · EM FOCO':''}`,'tag'),element('h3',p.title),element('p',`${p.bedrooms} quartos · ${p.city}`),element('div',fmt(c.known),'price'),element('p',c.complete?'Total mensal conhecido':'Subtotal parcial — há custos não informados','hint'));
 const breakdown=element('div','','costs');[['Aluguel',p.costs.rent],['Condomínio',p.costs.condo],['IPTU / mês',p.costs.iptu],['Combustível / mês',p.scenarios[scenario].fuel]].forEach(([k,v])=>{const s=element('span',k);s.append(element('strong',fmt(v)));breakdown.append(s);});card.append(breakdown,element('small',`Verificado em ${new Date(p.verifiedAt).toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'})}. Fonte do combustível: ${p.scenarios[scenario].source||'não informada'}`));const a=element('a','Ver anúncio individual ↗');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);$('listings').append(card);});
 if(markers){markers.clearLayers();rows.filter(p=>p.coordinates).forEach(p=>{const content=element('span',`${p.title} · ${p.neighborhood}`);L.marker(p.coordinates).addTo(markers).bindPopup(content);});if(markers.getLayers().length)map.fitBounds(markers.getBounds(),{maxZoom:14,padding:[25,25]});}
}
try {
 const response=await fetch('/data/estudo.json',{cache:'no-store'});if(!response.ok)throw Error(`HTTP ${response.status}`);data=await response.json();const errors=validate(data);if(errors.length)throw Error(errors.join('; '));
 $('status').textContent=data.updatedAt?`Publicação: ${new Date(data.updatedAt).toLocaleDateString('pt-BR')}${stale(data.updatedAt)?' · Dados antigos: publicação com mais de 7 dias.':''}`:'Estudo ainda não publicado · Nenhum anúncio real disponível nesta versão.';
 [...new Set([...priority,...data.listings.map(p=>p.neighborhood)])].sort((a,b)=>a.localeCompare(b,'pt-BR')).forEach(n=>$('neighborhood').add(new Option(n,n)));
 $('observations').replaceChildren(...data.observations.map(o=>element('p',`Não validado: ${o.text}`)),...data.listings.filter(p=>!p.verified||p.status!=='active'||stale(p.verifiedAt)).map(p=>element('p',`${p.title} · ${p.neighborhood} — ${stale(p.verifiedAt)?'verificação ausente ou antiga':p.status==='inactive'?'inativo':'não verificado'}`)));
 if(!$('observations').children.length)$('observations').append(element('p','Nenhuma observação publicada.'));
 if(window.L){map=L.map('map').setView([-22.9246,-45.4613],12);markers=L.featureGroup().addTo(map);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).on('tileerror',()=>{$('map-status').textContent='Base cartográfica indisponível. A comparação continua disponível.';}).addTo(map);}else $('map-status').textContent='Mapa indisponível: Leaflet não carregou.';
 ['bedrooms','neighborhood','scenario'].forEach(id=>$(id).addEventListener('change',render));render();
}catch(error){$('status').textContent=`Dados indisponíveis ou inválidos. Nenhum imóvel foi classificado. ${error.message}`;$('listings').replaceChildren(element('p','Corrija a publicação do JSON para retomar a comparação.'));}
