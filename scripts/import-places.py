"""Build the municipal directory from the official 2025 StatCan boundary extract.

Usage: python3 scripts/import-places.py work/nationwide
The source reference date is January 1, 2025; see DATA-SOURCES.md.
"""
import collections, json, math, pathlib, re, sys, unicodedata

root = pathlib.Path(__file__).resolve().parents[1]
source = pathlib.Path(sys.argv[1])
features = sum((json.loads(p.read_text())['features'] for p in sorted(source.glob('statcan-2025-*.json'))), [])
assert len(features) == 5054 and len({f['attributes']['CSDUID'] for f in features}) == 5054
old = json.loads((root/'lib/content.json').read_text())
provinces = dict(zip(['35','48','59','47','46','24','12','13','11','10','60','61','62'], [r['slug'] for r in old['regions']]))
types = {
 'C':'City / Cité','CC':'Chartered community','CG':'Community government','CT':'Canton (municipalité de)',
 'CU':'Cantons unis (municipalité de)','CV':'City / Ville','CY':'City','DM':'District municipality','FD':'Fire district',
 'GR':'Gouvernement régional','HAM':'Hamlet','ID':'Improvement district','IGD':'Indian government district',
 'IM':'Island municipality','IRI':'Indian reserve / Réserve indienne','LGD':'Local government district',
 'M':'Municipality / Municipalité','MD':'Municipal district','MÉ':'Municipalité','MRM':'Regional municipality / Municipalité régionale',
 'MU':'Municipality','NH':'Northern hamlet','NL':"Nisga’a land",'NO':'Unorganized / Non organisé','NV':'Northern village',
 'PE':'Paroisse (municipalité de)','RCR':'Rural community / Communauté rurale','RDA':'Regional district electoral area',
 'RDR':'Rural district / District rural','RGM':'Regional municipality','RM':'Rural municipality','RMU':'Resort municipality',
 'RV':'Resort village','SA':'Special area','SC':'Subdivision of county municipality','SÉ':'Settlement / Établissement',
 'S-É':'Indian settlement / Établissement indien','SET':'Settlement','SG':'Self-government / Autonomie gouvernementale',
 'SM':'Specialized municipality','SNO':'Subdivision of unorganized','SV':'Summer village','T':'Town','TAL':'Tla’amin Lands',
 'TC':'Terres réservées aux Cris','TI':'Terre inuite','TK':'Terres réservées aux Naskapis','TL':'Teslin land',
 'TP':'Township','TV':'Town / Ville','TWL':'Tsawwassen Lands','V':'Ville','VC':'Village cri','VK':'Village naskapi',
 'VL':'Village','VN':'Village nordique'
}
def normal(s):
 return re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKD',s.replace("'",'').replace('’','')).encode('ascii','ignore').decode().lower()).strip()
def slug(s): return normal(s).replace(' ','-')
aliases = {'quebec/quebec':'/quebec/quebec-city/','yukon/dawson':'/yukon/dawson-city/',
 'ontario/greater sudbury grand sudbury':'/ontario/sudbury/','ontario/prince edward county':'/ontario/prince-edward-county/'}
oldByName = {(c['province'],normal(c['name'])):c for c in old['cities']}
oldByPath = {c['path']:c for c in old['cities']}
groups = collections.defaultdict(list)
for f in features:
 a=f['attributes'];groups[(provinces[a['PRUID']],normal(a['CSDNAME']))].append(f)
# Preserve existing page URLs, including locations where a city and rural municipality share a name.
priority = {k:i for i,k in enumerate(['CY','C','CV','V','TV','T','RGM','SM','DM','MD','MU','MÉ','RM','TP'])}
places=[]; boundaries={}; used=set(); matched=[]
def simplify(points,tolerance):
 if len(points)<=2:return points
 a,b=points[0],points[-1];dx=b[0]-a[0];dy=b[1]-a[1];den=dx*dx+dy*dy
 def distance(p):
  t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)) if den else 0
  return (p[0]-a[0]-t*dx)**2+(p[1]-a[1]-t*dy)**2
 ds=[distance(p) for p in points[1:-1]];d=max(ds,default=0)
 if d<=tolerance*tolerance:return [a,b]
 i=ds.index(d)+1;return simplify(points[:i+1],tolerance)[:-1]+simplify(points[i:],tolerance)
for (province,nameKey),group in sorted(groups.items()):
 group.sort(key=lambda f:(priority.get(f['attributes']['CSDTYPE'],99),f['attributes']['CSDUID']))
 for i,f in enumerate(group):
  a=f['attributes'];uid=a['CSDUID'];name=re.sub(r'\s+',' ',a['CSDNAME']).strip();kind=a['CSDTYPE'];assert kind in types
  existing=oldByName.get((province,nameKey)) if i==0 and kind!='FD' else None
  if i==0 and province+'/'+nameKey in aliases:existing=oldByPath[aliases[province+'/'+nameKey]]
  if existing:path=existing['path'];matched.append(path)
  else:
   suffix='-'+slug(types[kind]) if len(group)>1 else ''
   path='/'+province+'/'+slug(name)+suffix+'/'
   if path in used or path in oldByPath:path=path[:-1]+'-'+uid+'/'
  assert path not in used;used.add(path)
  rings=f['geometry']['rings'];points=[p for ring in rings for p in ring]
  west=min(p[0] for p in points);east=max(p[0] for p in points);south=min(p[1] for p in points);north=max(p[1] for p in points)
  bounds=[west,south,east,north];lat=(north+south)/2;cos=math.cos(lat*math.pi/180)
  scale=min(540/max((east-west)*cos,1e-8),310/max(north-south,1e-8));ox=(600-(east-west)*cos*scale)/2;oy=(370-(north-south)*scale)/2
  paths=[]
  for ring in rings:
   xy=[(ox+(x-west)*cos*scale,oy+(north-y)*scale) for x,y in ring]
   xy=simplify(xy,.65)
   if len(xy)<4:continue
   paths.append('M'+'L'.join(f'{x:.1f},{y:.1f}' for x,y in xy)+'Z')
  # Tiny islands can collapse at the simplification threshold. Keep the original largest ring in that case.
  if not paths:
   ring=max(rings,key=len);paths=['M'+'L'.join(f'{ox+(x-west)*cos*scale:.1f},{oy+(north-y)*scale:.1f}' for x,y in ring)+'Z']
  boundaries[uid]=''.join(paths)
  places.append({'id':uid,'name':name,'path':path,'province':province,'type':kind,'typeName':types[kind],
   'division':re.sub(r'\s+',' ',a['CDNAME']).strip(),'divisionId':a['CDUID'],'bounds':bounds,
   'label':name+(' ('+types[kind]+')' if len(group)>1 else ''),'legacyPath':existing['path'] if existing else ''})
places.sort(key=lambda p:(p['province'],normal(p['name']),p['id']))
(root/'lib/places-data.json').write_text(json.dumps(places,ensure_ascii=False,separators=(',',':'))+'\n')
(root/'lib/place-boundaries.json').write_text(json.dumps(boundaries,separators=(',',':'))+'\n')
(root/'work/nationwide/import-report.json').write_text(json.dumps({'total':len(places),'matched':matched,'retainedRegionalGuides':[c['path'] for c in old['cities'] if c['path'] not in matched], 'byProvince':dict(collections.Counter(p['province'] for p in places))},indent=2))
print(json.dumps({'places':len(places),'matchedExisting':len(matched),'additionalRegionalGuides':len(old['cities'])-len(matched),'boundaryBytes':(root/'lib/place-boundaries.json').stat().st_size,'dataBytes':(root/'lib/places-data.json').stat().st_size}))
