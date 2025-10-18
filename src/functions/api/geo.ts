interface Env {
  JUSO_API_KEY: string;
}

const JUSO_ENDPOINT = 'https://business.juso.go.kr/addrlink/openApi/searchApi.do';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword') ?? url.searchParams.get('query');
  let data = await upstreamResponse.text();
  try {
    JSON.parse(data);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON returned by JUSO API" }), {
      status: 502,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const payload = new URLSearchParams({
    confmKey: env.JUSO_API_KEY,
    currentPage: url.searchParams.get('currentPage') ?? '1',
    countPerPage: url.searchParams.get('countPerPage') ?? '5',
    keyword,
    resultType: 'json',
  });

  const upstreamResponse = await fetch(`${JUSO_ENDPOINT}?${payload.toString()}`);

  if (!upstreamResponse.ok) {
    return new Response(JSON.stringify({ error: 'Failed to contact JUSO API' }), {
      status: upstreamResponse.status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const data = await upstreamResponse.text();
  return new Response(data, {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
