export function Logo({linked=true}:{linked?:boolean}) {
 const mark=<><img src="/brand/acreages-symbol.png" width={48} height={48} alt=""/><span className="logo-word">acreages<span>.ca</span></span></>;
 return linked?<a className="acreages-logo" href="/" aria-label="Acreages.ca home">{mark}</a>:<span className="acreages-logo" aria-label="Acreages.ca">{mark}</span>;
}
