import{handleEnquiry}from'@/lib/intake';import{intakeDb}from'@/db/intake';
export function POST(request:Request){return handleEnquiry(request,intakeDb)}
export function GET(){return new Response('Method not allowed',{status:405,headers:{Allow:'POST','Cache-Control':'no-store','X-Robots-Tag':'noindex'}})}
