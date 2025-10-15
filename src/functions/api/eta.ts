import { computeEta } from '../../db/db';
import type { EtaErrorResponse } from '../../shared/types';

interface Env {}

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const url = new URL(request.url);
  const origin = url.searchParams.get('origin');
  const destination = url.searchParams.get('destination');
  const departureTime = url.searchParams.get('departureTime') ?? undefined;

  if (!origin || !destination) {
    const error: EtaErrorResponse = { error: 'origin and destination are required query parameters' };
    return new Response(JSON.stringify(error), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const result = computeEta(origin, destination, departureTime);

  if (!result) {
    const error: EtaErrorResponse = {
      error: 'No route could be matched for the provided origin/destination pair.',
    };
    return new Response(JSON.stringify(error), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  return new Response(JSON.stringify(result), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
