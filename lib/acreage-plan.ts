import {regions, lifestyles, sizeChoices, budgetChoices, commuteChoices, timingChoices, normalize} from './content';

export type PlanPreferences = {
  province: string; location: string; type: string; size: string;
  budget: string; commute: string; timing: string;
};
export type PlanCheck = {id: string; title: string; detail: string};
export type PlanGuide = {title: string; href: string};
export type AcreagePlan = {
  preferences: PlanPreferences; location: string; typeName: string;
  nextStep: string; checks: PlanCheck[]; guides: PlanGuide[];
  region: {name: string; check: string; source: string; sourceName: string} | null;
};

export function initialPreferences(initial: Record<string, string> = {}): PlanPreferences {
  const location = (initial.location || '').slice(0, 160).trim();
  const normalized = normalize(location);
  const region = regions.find(r => r.slug === initial.province) || regions.find(r =>
    normalized === normalize(r.name) || normalized === normalize(r.code) ||
    normalized.endsWith(' ' + normalize(r.name)) || normalized.endsWith(' ' + normalize(r.code)));
  const town = !region ? location : [normalize(region.name), normalize(region.code)].includes(normalized) ? '' : location.replace(new RegExp('(?:,?\\s+)(?:' + region.name + '|' + normalize(region.name) + '|' + region.code + ')$', 'i'), '').trim();
  return {
    province: region?.slug || 'any', location: town,
    type: lifestyles.some(l => l.slug === initial.type) ? initial.type : 'any',
    size: sizeChoices.includes(initial.size) ? initial.size : sizeChoices[0],
    budget: budgetChoices.includes(initial.budget) ? initial.budget : budgetChoices[0],
    commute: commuteChoices.includes(initial.commute) ? initial.commute : commuteChoices[0],
    timing: timingChoices.includes(initial.timing) ? initial.timing : timingChoices[0],
  };
}

export function buildAcreagePlan(preferences: PlanPreferences): AcreagePlan {
  const p = {...preferences, location: preferences.location.trim()};
  const region = regions.find(r => r.slug === p.province);
  const life = lifestyles.find(l => l.slug === p.type);
  const location = [p.location, region?.name].filter(Boolean).join(', ') || 'Open to locations across Canada';
  const bareLand = p.type === 'vacant-land';
  const checks: PlanCheck[] = [
    {id: 'use', title: bareLand ? 'Check the intended use before planning a build' : 'Write down what the property must let you do', detail: bareLand ? 'Take a specific building or land-use idea to the responsible planning authority. Confirm access, servicing and site constraints before treating a parcel as buildable.' : 'Separate essential uses from nice-to-haves. Ask the planning authority about the actual parcel before relying on a description such as hobby farm or country home.'},
    {id: 'land', title: 'Compare usable ground with stated acreage', detail: (p.size === 'Any size' ? 'Decide how much land you want to use and maintain.' : `Your preferred range is ${p.size}. Decide how much of that area must be usable for your plans.`) + ' Note slopes, wet areas, wooded ground and shared access; a municipal map does not establish property boundaries.'},
    {id: 'records', title: 'Gather title, boundary and access information', detail: 'Ask for available surveys, registered rights and road-maintenance arrangements. Have an appropriate local professional review the legal interest and access for a specific property.'},
    {id: 'services', title: bareLand ? 'Investigate water, wastewater and utility feasibility' : 'Review the home and its private systems', detail: bareLand ? 'Ask the responsible authorities and qualified contractors what your proposed use would require. Seek property-specific feasibility advice and estimates before assuming services can be installed.' : 'Request well, water-test and septic records where applicable. Arrange suitable inspections of the home, heating, electrical service and outbuildings; check capacity for your intended use.'},
    {id: 'costs', title: 'Build a whole-property cost list', detail: (p.budget === 'Budget flexible' ? 'Set a comfortable purchase range.' : `Use ${p.budget} as your stated purchase preference.`) + ' Keep a separate list for inspections, closing, insurance, utilities, maintenance and planned improvements. Get property-specific estimates instead of using acreage alone.'},
  ];
  if (life && !bareLand) checks.push({id: 'lifestyle', title: `Review the details for ${life.name.toLowerCase()}`, detail: life.checks.join('; ') + '. Bring these priorities to the people reviewing the property.'});
  checks.push({id: 'travel', title: p.commute === 'No preference' ? 'Choose the places you need to reach' : `Test a regular trip of ${p.commute.toLowerCase()}`, detail: 'List work, schools, appointments and regular trips. Test the actual route at relevant times and in different conditions. A travel preference is not a verified journey time or a map radius.'});
  const guides: PlanGuide[] = [
    {title: 'Your acreage buying checklist', href: '/guides/buying-an-acreage-checklist/'},
    {title: bareLand ? 'Questions about dividing land' : 'Well and septic questions', href: bareLand ? '/guides/can-i-sever-my-land/' : '/guides/well-and-septic-checklist/'},
  ];
  if (['hobby-farms', 'equestrian'].includes(p.type)) guides.push({title: 'Acreage or hobby farm?', href: '/guides/acreage-vs-hobby-farm/'});
  if (p.commute !== 'No preference') guides.push({title: 'Plan a rural commute', href: '/guides/planning-your-rural-commute/'});
  if (region) {
    guides.unshift({title: `Explore ${region.name}`, href: '/' + region.slug + '/'});
    guides.splice(1, 0, {title: p.location ? `Find ${p.location} in the ${region.name} directory` : `All ${region.name} communities`, href: '/' + region.slug + '/places/' + (p.location ? '?q=' + encodeURIComponent(p.location) : '')});
  } else guides.unshift({title: 'Compare Canadian cities and communities', href: '/locations/'});
  return {
    preferences: p, location, typeName: life?.name || 'Open to property types', checks, guides,
    nextStep: p.timing === 'Within 3 months' ? 'Start gathering property records and identifying the local professionals you will need. Resolve property-specific questions before making commitments.' : p.timing === 'Just exploring' ? 'Start by comparing a few communities and deciding which land uses matter most. Use this checklist to shape your first property visits.' : `Your timing is ${p.timing.toLowerCase()}. Narrow the areas, land uses and ownership commitments you would consider, then revisit the plan as your move gets closer.`,
    region: region ? {name: region.name, check: region.check, source: region.source, sourceName: region.sourceName} : null,
  };
}

export function planText(plan: AcreagePlan, reviewed: string[] = [], origin = '') {
  const p = plan.preferences;
  return ['MY ACREAGE PLAN', plan.location, plan.typeName,
    `Land: ${p.size}`, `Budget: ${p.budget}`, `Travel preference: ${p.commute}`, `Timing: ${p.timing}`,
    '', 'YOUR NEXT STEP', plan.nextStep, '', 'QUESTIONS TO WORK THROUGH',
    ...plan.checks.map(c => `[${reviewed.includes(c.id) ? 'x' : ' '}] ${c.title}\n${c.detail}`),
    ...(plan.region ? ['', `${plan.region.name.toUpperCase()}: LOCAL STARTING POINT`, plan.region.check, plan.region.source] : []),
    '', 'CONTINUE YOUR RESEARCH', ...plan.guides.map(g => `${g.title}: ${origin}${g.href}`),
    '', 'This plan organizes your preferences and research questions. Property suitability, availability, condition and permissions require individual review.',
  ].join('\n\n');
}

export function enquiryPlanBrief(plan: AcreagePlan, reviewed: string[]) {
  return [
    'Acreage plan requested by visitor', `Province / territory: ${plan.region?.name || 'Open to options'}`,
    ...plan.checks.map(c => `${reviewed.includes(c.id) ? 'Reviewed' : 'To review'}: ${c.title}`),
    ...(plan.region ? [`Regional focus: ${plan.region.check}`] : []),
  ].join('\n');
}
