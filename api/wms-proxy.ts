import { handleWmsProxy } from './_lib/edge-proxy';

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

const WMS_TARGET_URL = 'https://ags.cuzk.cz/arcgis2/services/dmr5g/ImageServer/WMSServer';

export default async function handler(request: Request): Promise<Response> {
  return handleWmsProxy(request, {
    targetUrl: WMS_TARGET_URL,
    serviceName: 'WMS DMR5G'
  });
}
