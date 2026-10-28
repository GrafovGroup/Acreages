import content from './content.json';
export const {regions,cities,lifestyles}=content;
export const sizeChoices=['Any size','1–5 acres','5–10 acres','10–25 acres','25–50 acres','50–100 acres','100+ acres'];
export const budgetChoices=['Budget flexible','Under $500,000','$500,000–$1 million','$1–2 million','$2–5 million','$5 million+'];
export const commuteChoices=['No preference','30 minutes','60 minutes','90 minutes','2 hours'];
export const timingChoices=['Just exploring','Within 3 months','3–6 months','6–12 months','More than a year'];
export function requestPath(intent='buy',params:Record<string,string>={}){const q=new URLSearchParams(Object.entries(params).filter(([,v])=>v&&v!=='any'));return '/'+intent+'/'+(q.size?'?'+q:'')}
export function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
