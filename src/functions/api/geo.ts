/**
 * NeoQik Reverse ETA - 행안부 JUSO API Proxy
 * --------------------------------------------------
 * GET /api/geo?query=서울 강남구 테헤란로
 *
 * 내부적으로:
 *   https://business.juso.go.kr/addrlink/openApi/searchApi.do
 *   + confmKey=${API_KEY}&currentPage=1&countPerPage=10&keyword=${query}
 */

export const onRequestGet: PagesFunction = async (context) => {
  const url = new URL(context.request.url);
  const query = url.searchParams.get("query");
  const apiKey = context.env?.JUSO_API_KEY;

  if (!query) {
    return new Response(JSON.stringify({ error: "query required" }), { status: 400 });
  }

  const jusoUrl = `https://business.juso.go.kr/addrlink/openApi/searchApi.do?confmKey=${apiKey}&currentPage=1&countPerPage=5&keyword=${encodeURIComponent(
    query
  )}&resultType=json`;

  try {
    const res = await fetch(jusoUrl);
    const data = await res.json();

    if (!data.results?.juso?.length) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // 📍 변환 결과: 도로명 + 좌표 (lon/lat)
    const results = data.results.juso.map((j: any) => ({
      roadAddr: j.roadAddr,
      jibunAddr: j.jibunAddr,
      zipNo: j.zipNo,
      lat: parseFloat(j.entX || j.lat || 0),
      lng: parseFloat(j.entY || j.lon || 0),
    }));

    return new Response(JSON.stringify({ results }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
