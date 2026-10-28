import registry from './images.json';
export type Asset={key:string;alt:string;location:string;creator:string;sourcePage:string;license:string;licenseUrl:string;position:string;files:{width:number;height:number;avif:string;webp:string;avifBytes:number;webpBytes:number}[]};
export const images=registry as Record<string,Asset>;
export const regionPhoto=(slug:string,second=false)=>slug+'-'+(second?'2':'1');
export function imageUrl(key:string){const a=images[key];return a?.files.find(f=>f.width===1200)?.webp??a?.files.at(-1)?.webp}
