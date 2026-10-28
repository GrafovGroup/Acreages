import{env}from'cloudflare:workers';
export function intakeDb(){if(!env.DB)throw new Error('Enquiry storage unavailable');return env.DB}
