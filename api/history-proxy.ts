import { handleWmsProxy } from './_lib/edge-proxy';

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

// Císařské otisky stabilního katastru (1824–1843)
const HISTORY_TARGET_URL = 'https://ags.cuzk.cz/arcgis/services/Cisarske_otisky/MapServer/WMSServer';

export default async function handler(request: Request): Promise<Response> {
  return handleWmsProxy(request, {
    targetUrl: HISTORY_TARGET_URL,
    serviceName: 'History ČÚZK'
  });
}
