export const scenarios = ['Antônio dirige desde a manhã','Juliane dirige desde a manhã','Carros separados','Carona + recuperar carro de Antônio','Carona + recuperar carro de Juliane'];
export const priority = ['Residencial Pasin','Mombaça','Castolira'];
const money = x => x === null || (typeof x === 'number' && Number.isFinite(x) && x >= 0);
const date = x => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(x) && Number.isFinite(Date.parse(x));
export function validate(d) {
 const errors = [];
 if (!d || d.version !== 1) return ['Versão de contrato inválida'];
 if (!date(d.updatedAt) && d.updatedAt !== null) errors.push('updatedAt inválido');
 if (!Array.isArray(d.listings) || !Array.isArray(d.observations)) return [...errors,'Listas ausentes'];
 const ids = new Set();
 for (const [i,p] of d.listings.entries()) {
  const fail = msg => errors.push(`Imóvel ${i+1}: ${msg}`);
  if (!p || typeof p !== 'object') { fail('objeto inválido'); continue; }
  if (typeof p.id !== 'string' || !p.id || ids.has(p.id)) fail('id ausente ou duplicado'); ids.add(p.id);
  if (typeof p.title !== 'string' || !p.title.trim() || typeof p.neighborhood !== 'string' || !p.neighborhood.trim() || p.city !== 'Pindamonhangaba') fail('identificação inválida');
  if (![2,3].includes(p.bedrooms)) fail('quartos deve ser 2 ou 3');
  if (!['active','inactive','unverified'].includes(p.status) || typeof p.verified !== 'boolean') fail('status inválido');
  if (p.verifiedAt !== null && (!date(p.verifiedAt) || Date.parse(p.verifiedAt)>Date.now())) fail('verificação inválida');
  if (p.verified && !date(p.verifiedAt)) fail('verificado sem data');
  try { if (!['https:','http:'].includes(new URL(p.url).protocol)) fail('URL insegura'); } catch { fail('URL inválida'); }
  if (!p.costs || !['rent','condo','iptu'].every(k=>money(p.costs[k]))) fail('custos inválidos');
  if (!Array.isArray(p.scenarios) || p.scenarios.length !== 5 || !p.scenarios.every(s=>s && money(s.fuel) && (s.fuel===null || (typeof s.source==='string' && s.source.trim())))) fail('cinco cenários com fonte obrigatória');
  if (p.coordinates !== null && (!Array.isArray(p.coordinates) || p.coordinates.length!==2 || !p.coordinates.every(Number.isFinite) || Math.abs(p.coordinates[0])>90 || Math.abs(p.coordinates[1])>180)) fail('coordenadas inválidas');
 }
 if (!d.observations.every(o=>o && typeof o.text==='string' && o.text.trim())) errors.push('Observação inválida');
 return errors;
}
export function stale(timestamp, now=Date.now()) { return !timestamp || now-Date.parse(timestamp)>7*86400000; }
export function costs(p, scenario) {
 const values=[p.costs.rent,p.costs.condo,p.costs.iptu,p.scenarios[scenario].fuel];
 return {known:values.reduce((s,v)=>s+(v??0),0),complete:values.every(v=>v!==null)};
}
export function select(d,{bedrooms='',neighborhood='',scenario=0}={}) {
 return d.listings.filter(p=>p.verified && p.status==='active' && !stale(p.verifiedAt) && (!bedrooms || p.bedrooms===Number(bedrooms)) && (!neighborhood || p.neighborhood===neighborhood)).sort((a,b)=>Number(costs(b,scenario).complete)-Number(costs(a,scenario).complete) || costs(a,scenario).known-costs(b,scenario).known);
}
