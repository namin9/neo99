/**
 * NeoQik Reverse ETA - Core API
 * -------------------------------------------------
 * POST /api/eta
 * body: { pickup: { lat, lng }, destination: { lat, lng }, targetArrival?: string }
 * 
 * 반환: {
 *   best: {...},        // 가장 빠른 도착 경로
 *   alternatives: [...]  // ETA 순으로 정렬된 상위 3개
 * }
 */

import fs from "fs";
import path from "path";

// ------------------------------------------------------
// 1️⃣ JSON 데이터 로드
// ------------------------------------------------------
const dataRoot = path.resolve("src/db/seed");

const terminals = JSON.parse(fs.readFileSync(path.join(dataRoot, "terminals.json"), "utf-8"));
const routes = JSON.parse(fs.readFileSync(path.join(dataRoot, "routes.json"), "utf-8"));
const schedules = JSON.parse(fs.readFileSync(path.join(dataRoot, "schedules.json"), "utf-8"));

// ------------------------------------------------------
// 2️⃣ 거리 계산 (Haversine Formula)
// ------------------------------------------------------
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ------------------------------------------------------
// 3️⃣ 가까운 터미널 탐색
// ------------------------------------------------------
function findNearestTerminals(lat: number, lng: number, count = 3) {
  const distances = terminals.map((t: any) => ({
    ...t,
    dist_km: t.lat && t.lng ? haversine(lat, lng, t.lat, t.lng) : Infinity,
  }));

  return distances
    .filter((d) => d.dist_km !== Infinity)
    .sort((a, b) => a.dist_km - b.dist_km)
    .slice(0, count);
}

// ------------------------------------------------------
// 4️⃣ Reverse ETA 계산 로직
// ------------------------------------------------------
function calculateReverseETA(pickup: any, destination: any) {
  // 1) 도착지 근처 터미널 후보
  const nearbyDestTerminals = findNearestTerminals(destination.lat, destination.lng, 3);

  const results: any[] = [];

  for (const destTerm of nearbyDestTerminals) {
    // 2) 해당 도착 터미널까지 오는 노선 찾기
    const inboundRoutes = routes.filter(
      (r: any) =>
        r.destination_name === destTerm.name || r.destination_id === destTerm.id
    );

    for (const route of inboundRoutes) {
      // 3) 해당 노선의 출발 터미널 정보
      const originTerm = terminals.find(
        (t: any) => t.name === route.origin_name || t.id === route.origin_id
      );
      if (!originTerm || !originTerm.lat || !originTerm.lng) continue;

      // 4) 스케줄 중 가장 가까운 출발시각 하나 선택 (단순화)
      const routeSchedules = schedules.filter((s: any) => s.route_id === route.id);
      const nextDeparture = routeSchedules.length ? routeSchedules[0].departure_time : "N/A";

      // 5) 픽업지 → 출발터미널 거리
      const firstMile = haversine(pickup.lat, pickup.lng, originTerm.lat, originTerm.lng);
      const firstMileMin = firstMile / 0.5 * 1; // 30km/h 가정 → 분 단위

      // 6) 버스 이동시간
      const busMin = route.duration_min || route.distance_km * 1; // km ≈ 1분 가정 fallback

      // 7) 터미널 → 도착지 거리 (last-mile)
      const lastMile = haversine(destTerm.lat, destTerm.lng, destination.lat, destination.lng);
      const lastMileMin = lastMile / 0.5 * 1;

      // 총 소요시간
      const totalMin = firstMileMin + busMin + lastMileMin;

      results.push({
        route_id: route.id,
        origin: originTerm.name,
        destination: destTerm.name,
        company: route.company,
        grade: route.grade,
        bus_time: busMin,
        total_time_min: totalMin,
        total_time_hr: (totalMin / 60).toFixed(1),
        first_mile_km: firstMile.toFixed(1),
        last_mile_km: lastMile.toFixed(1),
        next_departure,
      });
    }
  }

  const sorted = results.sort((a, b) => a.total_time_min - b.total_time_min);
  return {
    best: sorted[0] || null,
    alternatives: sorted.slice(0, 3),
  };
}

// ------------------------------------------------------
// 5️⃣ Cloudflare Pages Functions Handler
// ------------------------------------------------------
export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = await context.request.json();
    const { pickup, destination } = body;

    if (!pickup || !destination) {
      return new Response(JSON.stringify({ error: "pickup/destination required" }), {
        status: 400,
      });
    }

    const result = calculateReverseETA(pickup, destination);

    return new Response(JSON.stringify(result, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
