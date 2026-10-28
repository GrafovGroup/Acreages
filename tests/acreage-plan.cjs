// Run with: node tests/acreage-plan.cjs
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText.replace(/require\("\.\/content"\)/g, 'require("./content.ts")'), filename);
const {initialPreferences,buildAcreagePlan,planText,enquiryPlanBrief} = require('../lib/acreage-plan.ts');
const {handleEnquiry} = require('../lib/intake.ts');
const {regions,lifestyles} = require('../lib/content.ts');
const checks=[];
function ok(name,fn){fn();checks.push(name)}
for (const [input,province,location] of [
  [{location:'Calgary, Alberta'},'alberta','Calgary'],
  [{location:'Montréal, Quebec'},'quebec','Montréal'],
  [{location:'Québec'},'quebec',''],
  [{location:'Caledon',province:'ontario'},'ontario','Caledon'],
  [{location:'Brandon, MB'},'manitoba','Brandon'],
]) ok('Location context: '+input.location,()=>assert.deepEqual([initialPreferences(input).province,initialPreferences(input).location],[province,location]));
ok('Invalid query preferences fall back to available choices',()=>assert.equal(initialPreferences({type:'fake',budget:'fake'}).type,'any'));
const hobby = buildAcreagePlan(initialPreferences({location:'Calgary, Alberta',type:'hobby-farms',size:'5–10 acres',budget:'$500,000–$1 million',commute:'60 minutes'}));
ok('Plan carries original search preferences into relevant questions',()=>{assert.match(hobby.checks.find(c=>c.id==='land').detail,/5–10 acres/);assert.match(hobby.checks.find(c=>c.id==='costs').detail,/\$500,000/);assert.ok(hobby.guides.some(g=>g.href==='/alberta/places/?q=Calgary'));assert.ok(hobby.guides.some(g=>g.href.includes('acreage-vs-hobby-farm')))});
const vacant = buildAcreagePlan(initialPreferences({type:'vacant-land',timing:'Within 3 months'}));
ok('Vacant land asks about feasibility and does not assume a dwelling',()=>{assert.match(vacant.checks.find(c=>c.id==='services').title,/feasibility/);assert.ok(!vacant.checks.some(c=>/Review the home/.test(c.title)));assert.match(vacant.nextStep,/records/)});
ok('Downloads include reviewed state, complete questions and source links',()=>{const text=planText(hobby,['land'],'https://acreages.example');assert.match(text,/\[x\] Compare usable/);assert.match(text,/https:\/\/acreages.example\/alberta\//);assert.match(text,/alberta.ca\/rural-landowner/)});
ok('All provinces and property types generate complete bounded plans',()=>{for(const r of regions)for(const l of lifestyles){const p=buildAcreagePlan(initialPreferences({province:r.slug,type:l.slug}));assert.ok(p.region);assert.equal(new Set(p.checks.map(c=>c.id)).size,p.checks.length);assert.ok(enquiryPlanBrief(p,[]).length<3000);assert.ok(p.guides.every(g=>g.href.startsWith('/')))}});
(async()=>{
let stored;
const db = {
  prepare(sql) {
    return {
      bind(...values) {
        return {
          async first() {
            if (sql.startsWith('SELECT reference')) return null;
            stored = JSON.parse(values[7]);
            return {reference: values[1]};
          }
        };
      }
    };
  }
};
const base={id:crypto.randomUUID(),name:'Planner QA',email:'qa@example.invalid',location:hobby.location,intent:'buy',...hobby.preferences,location:hobby.location,consent:true,introductionConsent:false,planBrief:enquiryPlanBrief(hobby,['land']),notes:'Please help with the questions in my plan.'};
async function submit(data){return handleEnquiry(new Request('https://acreages.test/api/enquiries/',{method:'POST',headers:{'content-type':'application/json',origin:'https://acreages.test'},body:JSON.stringify(data)}),()=>db)}
let response=await submit(base);assert.equal(response.status,201);assert.equal(stored.introductionConsent,false);assert.match(stored.planBrief,/Reviewed: Compare usable/);checks.push('Enquiry storage includes checklist status and separate declined introduction');
response=await submit({...base,id:crypto.randomUUID(),introductionConsent:true});assert.equal(response.status,201);assert.equal(stored.introductionConsent,true);checks.push('Optional introduction consent stored distinctly');
response=await submit({...base,consent:false});assert.equal(response.status,400);response=await submit({...base,introductionConsent:'yes'});assert.equal(response.status,400);response=await submit({...base,planBrief:'x'.repeat(3001)});assert.equal(response.status,400);checks.push('Required response consent, optional consent type and brief length validated');
console.log(JSON.stringify({passed:checks.length,checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
