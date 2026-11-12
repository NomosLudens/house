import {test,expect} from '@playwright/test';
const fixture=()=>({version:1,updatedAt:new Date().toISOString(),observations:[{text:'Observação sintética de teste'}],listings:[{id:'test',title:'FIXTURE SINTÉTICA',city:'Pindamonhangaba',neighborhood:'Mombaça',bedrooms:2,status:'active',verified:true,verifiedAt:new Date().toISOString(),url:'https://example.org/test',costs:{rent:1000,condo:100,iptu:50},scenarios:Array.from({length:5},(_,i)=>({fuel:100+i*10,source:'teste sintético'})),coordinates:[-22.92,-45.46]}]});
test('publicação vazia honesta e layout sem transbordamento',async({page})=>{
 await page.goto('/');await expect(page.locator('#status')).toContainText('Nenhum anúncio real');await expect(page.locator('.empty')).toContainText('Ainda não há anúncios');
 await expect(page.locator('.leaflet-container')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`test-results/house-${test.info().project.name}.png`,fullPage:true});
});
test('filtros, cinco cenários, link e observações',async({page})=>{
 await page.route('**/data/estudo.json',r=>r.fulfill({json:fixture()}));await page.goto('/');await expect(page.locator('.card')).toHaveCount(1);
 for(let i=0;i<5;i++){await page.selectOption('#scenario',String(i));await expect(page.locator('.price')).toContainText(String(1250+i*10).replace(/(\d)(\d{3})/,'$1.$2'));}
 await expect(page.locator('.card a')).toHaveAttribute('href','https://example.org/test');
 await page.selectOption('#bedrooms','3');await expect(page.locator('.card')).toHaveCount(0);await page.selectOption('#bedrooms','2');await page.selectOption('#neighborhood','Mombaça');await expect(page.locator('.card')).toHaveCount(1);
 await page.selectOption('#neighborhood','Castolira');await expect(page.locator('.card')).toHaveCount(0);await expect(page.locator('#observations')).toContainText('Não validado');
});
test('JSON inválido e indisponível falham sem ranking',async({page})=>{
 await page.route('**/data/estudo.json',r=>r.fulfill({json:{version:99}}));await page.goto('/');await expect(page.locator('#status')).toContainText('inválidos');await expect(page.locator('.card')).toHaveCount(0);
 await page.unroute('**/data/estudo.json');await page.route('**/data/estudo.json',r=>r.fulfill({status:404,body:'missing'}));await page.reload();await expect(page.locator('#status')).toContainText('HTTP 404');
});
test('anúncio antigo fica fora do ranking',async({page})=>{
 const d=fixture();d.updatedAt='2020-01-01T00:00:00Z';d.listings[0].verifiedAt=d.updatedAt;await page.route('**/data/estudo.json',r=>r.fulfill({json:d}));await page.goto('/');await expect(page.locator('#status')).toContainText('Dados antigos');await expect(page.locator('.card')).toHaveCount(0);await expect(page.locator('#observations')).toContainText('antiga');
});
