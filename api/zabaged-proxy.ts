import { handleWmsProxy } from './_lib/edge-proxy';

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

// ZABAGED vrstevnice - výškopis České republiky
const ZABAGED_VRSTEVNICE_URL = 'https://ags.cuzk.gov.cz/arcgis/services/ZABAGED_VRSTEVNICE/MapServer/WMSServer';

export default async function handler(request: Request): Promise<Response> {
  return handleWmsProxy(request, {
    targetUrl: ZABAGED_VRSTEVNICE_URL,
    serviceName: 'ZABAGED Vrstevnice'
  });
}


