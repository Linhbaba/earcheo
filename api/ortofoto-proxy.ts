import { handleWmsProxy } from './_lib/edge-proxy';

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

const ORTOFOTO_TARGET_URL = 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_PUB/service.svc/get';

export default async function handler(request: Request): Promise<Response> {
  return handleWmsProxy(request, {
    targetUrl: ORTOFOTO_TARGET_URL,
    serviceName: 'Ortofoto ČÚZK'
  });
}
