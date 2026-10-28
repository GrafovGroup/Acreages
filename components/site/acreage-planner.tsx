'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {Checkbox} from '@/components/ui/checkbox';
import {Choice} from './search';
import {Photo} from './image';
import {Enquiry} from './enquiry';
import {regions, lifestyles, sizeChoices, budgetChoices, commuteChoices, timingChoices} from '@/lib/content';
import {buildAcreagePlan, initialPreferences, planText, enquiryPlanBrief, type AcreagePlan} from '@/lib/acreage-plan';

export function AcreagePlanner({initial = {}}: {initial?: Record<string, string>}) {
  const [preferences, setPreferences] = useState(() => initialPreferences(initial));
  const [plan, setPlan] = useState<AcreagePlan | null>(null);
  const [editing, setEditing] = useState(true);
  const [reviewed, setReviewed] = useState<string[]>([]);
  const [contact, setContact] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const contactHeading = useRef<HTMLHeadingElement>(null);
  const set = (key: string, value: string) => setPreferences(p => ({...p, [key]: value}));
  useEffect(() => { if (plan && !editing) resultHeading.current?.focus(); }, [plan, editing]);
  useEffect(() => { if (contact) contactHeading.current?.focus(); }, [contact]);
  function build(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlan(buildAcreagePlan(preferences)); setReviewed([]); setEditing(false); setDownloaded(false);
  }
  function download() {
    if (!plan) return;
    const url = URL.createObjectURL(new Blob([planText(plan, reviewed, window.location.origin)], {type: 'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'my-acreage-plan.txt'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setDownloaded(true);
  }
  return <div className="acreage-planner">
    <section className="wrap planner-intro">
      <div><p className="eyebrow">FROM AN IDEA TO A CLEARER SEARCH</p><h1>Make room<br/>for your <em>plans.</em></h1><p>Choose what matters. Get your acreage checklist and regional reading list right here.</p><span className="planner-promise">NO EMAIL NEEDED · YOUR PLAN IN A FEW CLICKS</span></div>
      <Photo id="quebec-autumn-sunset" priority caption sizes="(max-width:700px) calc(100vw - 40px), 40vw"/>
    </section>
    {editing && <section className="wrap planner-editor">
      <div className="planner-section-heading"><p className="eyebrow">01 / YOUR STARTING POINT</p><h2 ref={editorHeading} tabIndex={-1}>{plan ? 'Adjust your preferences.' : 'What does your next chapter look like?'}</h2><p>Keep any answer open. You can change your plan at any time.</p></div>
      <form className="enquiry-form planner-form" onSubmit={build}>
        <fieldset><legend className="sr-only">Your acreage preferences</legend><div className="form-grid">
          <Choice id="plan-province" label="Province or territory" value={preferences.province} onChange={v => set('province', v)} choices={[["any", "Open to locations"], ...regions.map(r => [r.slug, r.name])]}/>
          <div className="field"><label htmlFor="plan-location">City or region (optional)</label><input id="plan-location" value={preferences.location} onChange={e => set('location', e.target.value)} maxLength={160} placeholder="e.g. Calgary or Foothills" autoComplete="address-level2"/></div>
          <Choice id="plan-type" label="Your kind of property" value={preferences.type} onChange={v => set('type', v)} choices={[["any", "Open to options"], ...lifestyles.map(l => [l.slug, l.name])]}/>
          <Choice id="plan-size" label="Preferred land size" value={preferences.size} onChange={v => set('size', v)} choices={sizeChoices}/>
          <Choice id="plan-budget" label="Purchase budget" value={preferences.budget} onChange={v => set('budget', v)} choices={budgetChoices}/>
          <Choice id="plan-timing" label="When are you thinking of moving?" value={preferences.timing} onChange={v => set('timing', v)} choices={timingChoices}/>
          <Choice id="plan-commute" label="Preferred travel time for regular trips" value={preferences.commute} onChange={v => set('commute', v)} choices={commuteChoices}/>
          <p className="planner-field-note">Your answers shape the research questions. They do not filter live listings or predict property availability.</p>
        </div><div className="planner-actions"><button className="button" type="submit">{plan ? 'UPDATE MY PLAN' : 'BUILD MY ACREAGE PLAN'} <span aria-hidden>↗</span></button>{plan && <button className="text-link" type="button" onClick={() => {setPreferences(plan.preferences); setEditing(false);}}>KEEP CURRENT PLAN</button>}</div>
        <p className="form-note">Your plan stays in this page until you choose to send an enquiry. Download it to keep a copy.</p>
        <noscript><p>Use our <Link href="/guides/buying-an-acreage-checklist/">acreage buying checklist</Link>, or call <a href="tel:+18336969996">(833) 696-9996</a> for help.</p></noscript></fieldset>
      </form>
    </section>}
    {plan && <section className="wrap plan-results" hidden={editing}>
      <div className="plan-result-heading"><p className="eyebrow">YOUR PERSONAL ACREAGE PLAN</p><h2 tabIndex={-1} ref={resultHeading}>A clearer path to<br/>{plan.typeName === 'Open to property types' ? 'your kind of space.' : plan.typeName.toLowerCase() + '.'}</h2><p className="plan-location">{plan.location}</p></div>
      <dl className="plan-preferences">{[['LAND',plan.preferences.size],['BUDGET',plan.preferences.budget],['TIMING',plan.preferences.timing],['TRAVEL PREFERENCE',plan.preferences.commute]].map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="planner-actions"><button className="button" type="button" onClick={download}>DOWNLOAD MY PLAN <span aria-hidden>↓</span></button><button className="text-link" type="button" onClick={() => window.print()}>PRINT / SAVE PDF</button><button className="text-link" type="button" onClick={() => {setEditing(true); setTimeout(() => editorHeading.current?.focus(), 0);}}>EDIT MY ANSWERS</button></div>
      <p className="planner-download-status" role="status">{downloaded ? 'Your text download was started. You can also print or save a PDF.' : 'Keep your plan before leaving this page. Checkmarks are saved in your downloaded copy.'}</p>
      <div className="plan-layout"><div>
        <div className="plan-next-step"><p className="eyebrow">START HERE</p><p>{plan.nextStep}</p></div>
        <div className="plan-check-heading"><h3>Questions to work through.</h3><p aria-live="polite">{reviewed.length} of {plan.checks.length} reviewed</p></div>
        <ul className="plan-checks">{plan.checks.map(check => <li key={check.id}><Checkbox id={'check-'+check.id} checked={reviewed.includes(check.id)} aria-describedby={'detail-'+check.id} onCheckedChange={value => {setReviewed(ids => value === true ? [...ids.filter(id => id !== check.id), check.id] : ids.filter(id => id !== check.id)); setDownloaded(false);}}/><div><label htmlFor={'check-'+check.id}>{check.title}</label><p id={'detail-'+check.id}>{check.detail}</p></div></li>)}</ul>
      </div><aside className="plan-reading">
        {plan.region && <div className="plan-region-note"><p className="eyebrow">A LOCAL STARTING POINT</p><h3>{plan.region.name}</h3><p>{plan.region.check}</p><a href={plan.region.source} target="_blank" rel="noopener noreferrer">{plan.region.sourceName} ↗</a></div>}
        <h3>Keep exploring.</h3><div className="plan-guide-links">{plan.guides.map(guide => <a href={guide.href} key={guide.href} target="_blank" rel="noopener noreferrer">{guide.title}<span aria-hidden>↗</span></a>)}</div><p className="small-note">Guides open in a new tab so your plan stays here. This is a research checklist; property suitability and permissions need individual review.</p>
      </aside></div>
      <section className="planner-contact"><div className="planner-contact-heading"><p className="eyebrow">ONLY IF YOU WANT A HAND</p><h2 ref={contactHeading} tabIndex={-1}>Put your plan<br/>in the conversation.</h2><p>Send your preferences and checklist to Acreages. Add a property link or a question, and tell us how to reach you.</p></div>
        {!contact ? <button className="button" type="button" onClick={() => setContact(true)}>ASK ABOUT MY PLAN <span aria-hidden>↗</span></button> : <Enquiry intent="buy" initial={{...plan.preferences, location: plan.location, notes: initial.notes || ''}} planBrief={enquiryPlanBrief(plan, reviewed)}/>}
      </section>
    </section>}
    <section className="wrap planner-alternative"><p>Selling a property? <Link href="/sell/">Prepare your seller brief ↗</Link></p><p>Prefer a conversation? <a href="tel:+18336969996">(833) 696-9996</a></p></section>
  </div>;
}
