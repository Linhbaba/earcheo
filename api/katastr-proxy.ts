import { handleWmsProxy } from './_lib/edge-proxy';

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

// Katastrální mapy ČÚZK
const KATASTR_URL = 'https://services.cuzk.gov.cz/wms/wms.asp';

export default async function handler(request: Request): Promise<Response> {
  return handleWmsProxy(request, {
    targetUrl: KATASTR_URL,
    serviceName: 'Katastrální mapy'
  });
}


