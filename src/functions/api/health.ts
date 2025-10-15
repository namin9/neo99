import { getRoutes, getTerminals } from '../../db/db';

interface Env {}

export const onRequestGet: PagesFunction<Env> = async () => {
  const payload = {
    status: 'ok',
    routes: getRoutes().length,
    terminals: getTerminals().length,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
