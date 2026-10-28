const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,resolveJsonModule:true}}).outputText.replace(/require\("(\.\/[^"\.]+)"\)/g, 'require("$1.ts")'),filename);
const {allPages}=require('../lib/pages.ts');
const {metadataFor,structuredFor}=require('../lib/seo.ts');
const {places,regionalGuides}=require('../lib/places.ts');
const {acreageFaqs}=require('../lib/faq.ts');
assert.equal(places.length,5054);
assert.equal(regionalGuides.length,12);
assert.equal(new Set(allPages.map(p=>p.path)).size,allPages.length);
for(const p of allPages){
 const m=metadataFor(p.path);
 assert.equal(m.alternates.canonical,'https://acreages.ca'+p.path);
 assert.ok(m.title && m.description);
 assert.equal(m.twitter.card,'summary_large_image');
 const image=m.openGraph.images[0].url;
 assert.ok(fs.existsSync('public'+image.replace('https://acreages.ca','')),image);
 const data=structuredFor(p.path);
 assert.equal(data['@graph'][0].url,m.alternates.canonical);
}
const faq=structuredFor('/')['@graph'].find(x=>x['@type']==='FAQPage');
assert.deepEqual(faq.mainEntity.map(x=>[x.name,x.acceptedAnswer.text]),acreageFaqs.map(x=>[x.question,x.answer]));
assert.equal(metadataFor('/missing/').robots.index,false);
console.log(`Validated ${allPages.length} unique canonical pages, social images, structured data, 5,054 municipalities and 12 editorial guides.`);
