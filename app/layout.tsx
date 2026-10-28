import type {Metadata} from 'next';
import './globals.css';
import{Logo}from'@/components/site/logo';
import{Header}from'@/components/site/header';
import{SITE_ORIGIN,jsonLd}from'@/lib/site';
export const metadata:Metadata={title:{default:'Acreages | Find Your Space',template:'%s | Acreages'},description:'Explore Canadian acreages, country homes, hobby farms and land. Find your region, plan your search or prepare a seller brief or request local expertise.',metadataBase:new URL(SITE_ORIGIN),verification:{google:'K2dlE3i83hoOd4verO3t8pToq6mGhkT7VRnjVVFqpmg',other:{'msvalidate.01':'8540AF3FE8C8197267E84BBE602115F7'}},robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large'}}};
// Static head links keep the favicon available before asynchronous page metadata resolves.
const faviconLinks=[
 {rel:'icon',href:'/favicon.ico?v=2',sizes:'16x16 32x32 48x48 64x64',type:'image/x-icon'},
 {rel:'icon',href:'/brand/acreages-favicon-v2.png',sizes:'96x96',type:'image/png'},
 {rel:'icon',href:'/favicon.svg?v=2',sizes:'any',type:'image/svg+xml'},
 {rel:'shortcut icon',href:'/favicon.ico?v=2'},
 {rel:'apple-touch-icon',href:'/apple-touch-icon.png?v=2',sizes:'180x180',type:'image/png'},
];
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en-CA"><head>{faviconLinks.map(icon=><link key={icon.rel+icon.href} {...icon}/>)}</head><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd({'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':SITE_ORIGIN+'/#organization',name:'Acreages',url:SITE_ORIGIN+'/',telephone:'+18336969996',logo:SITE_ORIGIN+'/brand/acreages-symbol.png',areaServed:{'@type':'Country',name:'Canada'}},{'@type':'WebSite','@id':SITE_ORIGIN+'/#website',name:'Acreages',url:SITE_ORIGIN+'/',inLanguage:'en-CA',publisher:{'@id':SITE_ORIGIN+'/#organization'}}]})}}/><a className="skip" href="#main">Skip to content</a><Header/>{children}<footer><div className="wrap footer-grid"><div><Logo/><p>A little more land.<br/>A different way to live.</p></div><div><h2>EXPLORE</h2><a href="/explore/">Canadian regions</a><a href="/locations/">All cities & communities</a><a href="/country-homes/">Country homes</a><a href="/hobby-farms/">Hobby farms</a><a href="/vacant-land/">Vacant land</a></div><div><h2>YOUR NEXT CHAPTER</h2><a href="/buy/">Build your acreage plan</a><a href="/sell/">Prepare to sell</a><a href="/specialists/">Find a specialist</a><a href="/partners/">Partner with Acreages</a></div><div><h2>GET TO KNOW US</h2><a href="/about/">About Acreages</a><a href="/guides/">The field guide</a><a href="/privacy/">Privacy</a><a href="/image-credits/">Photography</a></div></div><div className="wrap footer-bottom"><span>© 2026 Acreages</span><span>Canadian land. Considered decisions.</span><a href="tel:+18336969996">(833) 696-9996</a></div></footer></body></html>}
