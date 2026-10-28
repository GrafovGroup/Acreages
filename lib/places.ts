import raw from './places-data.json';
import{regions,cities,normalize}from'./content';

export type Place={id:string;name:string;label:string;path:string;province:string;type:string;typeName:string;division:string;divisionId:string;bounds:number[];legacyPath:string};
export const places:Place[]=raw;
export const placeByPath=new Map(places.map(p=>[p.path,p]));
export const regionBySlug=new Map(regions.map(r=>[r.slug,r]));
export const placesByProvince=new Map(regions.map(r=>[r.slug,places.filter(p=>p.province===r.slug)]));
export const placesByDivision=new Map<string,Place[]>();
for(const p of places){const group=placesByDivision.get(p.divisionId)||[];group.push(p);placesByDivision.set(p.divisionId,group)}
export const regionalGuides=cities.filter(c=>!placeByPath.has(c.path));
export const specialTenureTypes=new Set(['IRI','IGD','NL','SÉ','S-É','SG','TAL','TC','TI','TK','TL','TWL','VC','VK']);
export function placeTitle(p:Place){return (specialTenureTypes.has(p.type)||['yukon','northwest-territories','nunavut'].includes(p.province)?'Land enquiries in ':'Acreages near ')+p.name;}
export function placeLabel(p:Place){return p.label===p.name?p.name:p.name+' · '+p.typeName}
export function placeDescription(p:Place){const r=regionBySlug.get(p.province)!;return `Explore ${p.label}, ${r.code}, in ${p.division}. View the community boundary, compare regional locations and plan your rural-property enquiry.`;}
export function divisionPeers(p:Place){const division=placesByDivision.get(p.divisionId)||[];const group=division.length>1?division:placesByProvince.get(p.province)!;const x=(p.bounds[0]+p.bounds[2])/2,y=(p.bounds[1]+p.bounds[3])/2;return group.filter(n=>n.id!==p.id).sort((a,b)=>{const score=(n:Place)=>Math.pow(((n.bounds[0]+n.bounds[2])/2-x)*Math.cos(y*Math.PI/180),2)+Math.pow((n.bounds[1]+n.bounds[3])/2-y,2);return score(a)-score(b)}).slice(0,8)}
export function parsePlaceQuery(query:string){let term=normalize(query);const province=regions.find(r=>[normalize(r.name),normalize(r.code)].some(v=>term===v||term.endsWith(' '+v)));if(province){const suffix=[normalize(province.name),normalize(province.code)].find(v=>term===v||term.endsWith(' '+v))!;term=term.slice(0,term.length-suffix.length).trim()}return{term,province}}
export function searchPlaces(query:string){const{term,province}=parsePlaceQuery(query);const tokens=term.split(' ').filter(Boolean);const matches=(province?placesByProvince.get(province.slug)!:places).filter(p=>{const r=regionBySlug.get(p.province)!;const text=normalize(p.name+' '+p.label+' '+p.division+' '+r.name+' '+r.code);return tokens.every(t=>text.includes(t))});return matches.sort((a,b)=>Number(normalize(b.name)===term)-Number(normalize(a.name)===term)||a.name.localeCompare(b.name,'en-CA')||a.id.localeCompare(b.id))}
export const PLACE_SOURCE='https://www150.statcan.gc.ca/n1/en/catalogue/92-162-X2025001';
export const PLACE_SOURCE_NOTICE='Adapted from Statistics Canada, Census Subdivision Boundary File, 2025, reference date January 1, 2025. This does not constitute an endorsement by Statistics Canada of this product.';

export function placeSeoTitle(p:Place){return placeTitle(p)+', '+regionBySlug.get(p.province)!.code+(p.label===p.name?'':' — '+p.typeName+', '+p.division)}
