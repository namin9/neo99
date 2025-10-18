import { findTerminalMatches, getRoutes, getTerminals } from '../../db/db';

interface Env {}

export const onRequestGet: PagesFunction<Env> = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query) {
    const payload = {
      terminals: getTerminals().slice(0, 20),
      routes: getRoutes().slice(0, 20),
    };
    return new Response(JSON.stringify(payload), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }

  const matches = findTerminalMatches(query);
  return new Response(JSON.stringify({ query, matches }), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
