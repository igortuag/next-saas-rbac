export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  const code = searchParams.get('code');

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  return new Response(`Received code: ${code}`, { status: 200 });
}
