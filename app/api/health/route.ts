// Static health check — pre-rendered at build time, not a serverless function
// Saves a Vercel function slot on the Hobby plan
export const dynamic = 'force-static';

export function GET() {
  return Response.json({
    status: 'ok',
    version: '2.0.0',
    service: 'Sizabantu Barbershop API',
    message: 'Backend is operational',
  });
}
