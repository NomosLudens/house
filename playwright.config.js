import {defineConfig} from '@playwright/test';
const port = Number(process.env.HOUSE_TEST_PORT || 8787);
export default defineConfig({testDir:'./tests/browser',use:{baseURL:`http://127.0.0.1:${port}`,launchOptions:{executablePath:process.env.HOUSE_CHROMIUM || '/usr/bin/chromium',args:['--no-sandbox']}},webServer:{command:`npm run dev -- --ip 127.0.0.1 --port ${port}`,port,reuseExistingServer:true},projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844}}}]});
