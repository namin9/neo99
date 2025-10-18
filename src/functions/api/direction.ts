interface Env {
  NAVER_CLIENT_ID: string;
  NAVER_CLIENT_SECRET: string;
}

const NAVER_DIRECTION_ENDPOINT =
  'https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving';
const NAVER_MAP_SDK_ENDPOINT = 'https://oapi.map.naver.com/openapi/v3/maps.js';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  if (url.searchParams.has('sdk')) {
    return proxyMapSdk(env);
  }

  const start = url.searchParams.get('start');
  const goal = url.searchParams.get('goal');
  if (!start || !goal) {
    return new Response(JSON.stringify({ error: 'start and goal query parameters are required' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const query = new URLSearchParams({
    start,
    goal,
    option: url.searchParams.get('option') ?? 'trafast',
  });

  const upstreamResponse = await fetch(`${NAVER_DIRECTION_ENDPOINT}?${query.toString()}`, {
    headers: {
      'X-NCP-APIGW-API-KEY-ID': env.NAVER_CLIENT_ID,
      'X-NCP-APIGW-API-KEY': env.NAVER_CLIENT_SECRET,
    },
  });

  if (!upstreamResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to call Naver Direction API' }), {
      status: upstreamResponse.status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const data = await upstreamResponse.text();
  return new Response(data, {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};

async function proxyMapSdk(env: Env): Promise<Response> {
  const sdkUrl = `${NAVER_MAP_SDK_ENDPOINT}?ncpClientId=${encodeURIComponent(env.NAVER_CLIENT_ID)}`;
  const upstream = await fetch(sdkUrl);
  if (!upstream.ok) {
    return new Response('/* Failed to load Naver Map SDK */', {
      status: upstream.status,
      headers: { 'content-type': 'application/javascript; charset=utf-8' },
    });
  }

  return new Response(upstream.body, {
    headers: { 'content-type': 'application/javascript; charset=utf-8' },
  });
}
