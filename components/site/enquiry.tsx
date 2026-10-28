'use client';
import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {useForm, ValidationError} from '@formspree/react';
import {Checkbox} from '@/components/ui/checkbox';
import {Choice} from './search';
import {lifestyles, sizeChoices, budgetChoices, commuteChoices, timingChoices} from '@/lib/content';

const enquiryLabels: Record<string, string> = {
  buy: 'Buyer enquiry', sell: 'Seller enquiry',
  specialists: 'Specialist enquiry', partners: 'Partner enquiry',
};

export function Enquiry({intent, initial = {}, planBrief}: {intent: string; initial?: Record<string, string>; planBrief?: string}) {
  const [draft, setModel] = useState({
    location: initial.location?.slice(0, 160) || '',
    type: lifestyles.some(l => l.slug === initial.type) ? initial.type : 'any',
    size: sizeChoices.includes(initial.size) ? initial.size : sizeChoices[0],
    budget: budgetChoices.includes(initial.budget) ? initial.budget : budgetChoices[0],
    commute: commuteChoices.includes(initial.commute) ? initial.commute : commuteChoices[0],
    timing: timingChoices.includes(initial.timing) ? initial.timing : timingChoices[0],
  });
  const model = planBrief ? {
    ...draft, location: (initial.location || '').slice(0, 160),
    type: initial.type || 'any', size: initial.size || sizeChoices[0],
    budget: initial.budget || budgetChoices[0], commute: initial.commute || commuteChoices[0],
    timing: initial.timing || timingChoices[0],
  } : draft;
  const [state, sendToFormspree, resetFormspree] = useForm('maeygble');
  const [consent, setConsent] = useState(false);
  const [introductionConsent, setIntroductionConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const requestId = useRef<string | null>(null);
  const inFlight = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const sending = saving || state.submitting;
  const set = (key: string, value: string) => {
    requestId.current = null;
    setModel(previous => ({...previous, [key]: value}));
  };

  useEffect(() => { requestId.current = null; }, [planBrief, model.location, model.type, model.size, model.budget, model.commute, model.timing]);

  useEffect(() => {
    if (state.succeeded && receipt) document.getElementById('enquiry-receipt')?.focus();
  }, [state.succeeded, receipt]);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || state.succeeded) return;
    if (!consent) {
      setError('Please confirm that we may use these details to respond.');
      return;
    }
    const values = Object.fromEntries(Array.from(new FormData(event.currentTarget), ([key, value]) => [key, String(value)]));
    inFlight.current = true;
    setSaving(true);
    setError('');
    resetFormspree();
    requestId.current ??= crypto.randomUUID();
    try {
      // Keep the validated private record and stable reference before delivery.
      const response = await fetch('/api/enquiries/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify({...values, ...model, intent, id: requestId.current, consent, introductionConsent, planBrief: planBrief || ''}),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json() as {ok: boolean; message?: string; reference: string};
      if (!response.ok || !data.ok || !data.reference) throw new Error(data.message || 'Please try again.');
      setReceipt(data.reference);
      const {website, notes, ...fields} = values;
      await sendToFormspree({
        ...fields,
        location: model.location,
        ...(intent !== 'partners' ? {
          property_type: lifestyles.find(l => l.slug === model.type)?.name || 'Open to options',
          timing: model.timing,
        } : {}),
        ...(intent === 'buy' ? {land_size: model.size, budget: model.budget, travel_time: model.commute} : {}),
        intent,
        enquiry_type: enquiryLabels[intent],
        message: notes || '',
        reference: data.reference,
        consent: 'Agreed to use of these details to respond to this request; no marketing subscription.',
        introduction_permission: introductionConsent ? 'Would like to discuss a suitable professional introduction.' : 'No additional introduction requested.',
        ...(planBrief ? {acreage_plan: planBrief} : {}),
        source_page: window.location.href,
        _subject: `Acreages — ${enquiryLabels[intent]} — ${model.location}`,
        _gotcha: website || '',
      });
    } catch (cause) {
      resetFormspree();
      setError(cause instanceof Error && cause.name !== 'TimeoutError'
        ? cause.message
        : 'We could not confirm receipt. Your entries remain below; please try again.');
    } finally {
      inFlight.current = false;
      setSaving(false);
    }
  }

if(state.succeeded && receipt)return <section className="receipt" id="enquiry-receipt" tabIndex={-1}><p className="eyebrow">REQUEST RECEIVED</p><h2>Your next chapter<br/>starts here.</h2><p>Your reference is <strong>{receipt}</strong>. Keep it for your records.</p><p>We’ll review your details. Any property match or professional service is confirmed separately; sending this request does not create a representation agreement.</p><Link className="button" href="/explore/">KEEP EXPLORING ↗</Link></section>;
return <form ref={form} className="enquiry-form" aria-busy={sending} onSubmit={submit} onChange={()=>{requestId.current=null}}><fieldset disabled={sending}>{!planBrief && <><legend className="eyebrow">01 / {intent==='sell'?'YOUR PROPERTY':intent==='partners'?'YOUR SERVICE AREA':'YOUR PLANS'}</legend><div className="form-grid"><div className="field full"><label htmlFor="enquiry-location">{intent==='partners'?'Cities or regions you serve':'City, region or municipality'} *</label><input id="enquiry-location" name="location" value={model.location} onChange={e=>set('location',e.target.value)} maxLength={160} required autoComplete="address-level2" placeholder="Anywhere in Canada"/></div>{intent==='partners'?<div className="field full"><label htmlFor="brokerage">Brokerage or business *</label><input id="brokerage" name="brokerage" maxLength={180} required/></div>:<Choice id="type" label="Property type" value={model.type} onChange={v=>set('type',v)} choices={[["any","Open to options"],...lifestyles.map(l=>[l.slug,l.name])]}/>}{intent==='sell'?<><div className="field"><label htmlFor="acres">Approximate acres</label><input id="acres" name="acres" type="number" min="0.0001" step="any" max="10000000" placeholder="e.g. 12.5"/></div><div className="field full"><label htmlFor="address">Property address</label><input id="address" name="address" maxLength={300} autoComplete="street-address"/></div><div className="field"><label htmlFor="homeSize">Home size, if known</label><input id="homeSize" name="homeSize" maxLength={80} placeholder="e.g. 2,400 sq. ft."/></div><div className="field"><label htmlFor="buildings">Barns, workshop or outbuildings</label><input id="buildings" name="buildings" maxLength={500}/></div></>:intent==='buy'?<><Choice id="size" label="Preferred land size" value={model.size} onChange={v=>set('size',v)} choices={sizeChoices}/><Choice id="budget" label="Budget" value={model.budget} onChange={v=>set('budget',v)} choices={budgetChoices}/><Choice id="commute" label="Preferred travel time" value={model.commute} onChange={v=>set('commute',v)} choices={commuteChoices}/></>:null}{intent!=='partners'&&<Choice id="timing" label="Your timing" value={model.timing} onChange={v=>set('timing',v)} choices={timingChoices}/>}<div className="field full"><label htmlFor="notes">{intent==='partners'?'Your rural-property experience':'What matters most to you?'}</label><textarea id="notes" name="notes" defaultValue={initial.notes?.slice(0,4000)||''} rows={4} maxLength={4000} placeholder={intent==='sell'?'Tell us about the property and your plans.':intent==='partners'?'Tell us about your registration, territories and areas of expertise.':'Tell us about the home, land or local expertise you need.'}/></div></div></>}<p className={planBrief ? "eyebrow" : "eyebrow form-divider"}>{planBrief ? "YOUR PLAN IS INCLUDED / HOW TO REACH YOU" : "02 / HOW TO REACH YOU"}</p><div className="form-grid"><div className="field"><label htmlFor="name">Your name *</label><input name="name" id="name" maxLength={120} autoComplete="name" required/></div><div className="field"><label htmlFor="email">Email *</label><input name="email" id="email" aria-invalid={Boolean(state.errors?.getFieldErrors('email').length)} type="email" maxLength={254} autoComplete="email" required/></div><div className="field full"><label htmlFor="phone">Phone</label><input name="phone" id="phone" type="tel" maxLength={60} autoComplete="tel"/></div></div>{planBrief && <div className="field plan-request-notes"><label htmlFor="notes">A question or property link (optional)</label><textarea id="notes" name="notes" defaultValue={initial.notes?.slice(0,4000)||''} rows={4} maxLength={4000} placeholder="Share an authorized listing link, a property address or the question you want to work through."/></div>}<div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div><div className="consent"><Checkbox id="consent" checked={consent} onCheckedChange={v=>{requestId.current=null;setConsent(v===true)}} aria-required="true"/><label htmlFor="consent">I agree that Acreages may use these details to respond to my request. <Link href="/privacy/" target="_blank" rel="noopener noreferrer">Privacy details (new tab)</Link>.</label></div>{intent !== 'partners' && <div className="consent introduction-consent"><Checkbox id="introduction-consent" checked={introductionConsent} onCheckedChange={v=>{requestId.current=null;setIntroductionConsent(v===true)}}/><label htmlFor="introduction-consent">I would also like to discuss an introduction to a suitable local professional. (Optional)</label></div>}<div role="alert" className="form-error">{error}{state.errors && <><p>We could not deliver your enquiry. Your entries remain below; please review the message and try again.</p><ValidationError errors={state.errors}/>{state.errors.getAllFieldErrors().map(([field]) => <ValidationError key={field} field={field} prefix={String(field)} errors={state.errors}/>)}</>}</div><button className="button" type="submit">{sending?'SENDING…':intent==='sell'?'SEND MY SELLER BRIEF':intent==='partners'?'INTRODUCE YOUR BUSINESS':planBrief?'SEND MY PLAN & QUESTION':'SEND MY REQUEST'} <span aria-hidden>↗</span></button><p className="form-note">No marketing subscription. Introductions depend on location and professional availability.</p><noscript><p>Please call <a href="tel:+18336969996">(833) 696-9996</a> to discuss your enquiry.</p></noscript></fieldset></form>}
