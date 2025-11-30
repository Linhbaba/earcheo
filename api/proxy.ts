import { handleWmsProxy } from './_lib/edge-proxy';

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

// Proxy targets
const TARGETS = {
  wms: 'https://ags.cuzk.cz/arcgis2/services/dmr5g/ImageServer/WMSServer',
  ortofoto: 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_PUB/service.svc/get',
  katastr: 'https://services.cuzk.gov.cz/wms/wms.asp',
  zabaged: 'https://ags.cuzk.gov.cz/arcgis/services/ZABAGED_VRSTEVNICE/MapServer/WMSServer',
  archive: 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_ARCHIV/WMService.aspx',
} as const;

type ProxyType = keyof typeof TARGETS;

// Validní roky pro archivní ortofoto
const ARCHIVE_VALID_YEARS = [
  1998, 1999, 2000, 2001, 2003, 2004, 2005, 2006, 2007, 2008,
  2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
  2019, 2020, 2021, 2022, 2023, 2024
];

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') as ProxyType | null;

  if (!type || !TARGETS[type]) {
    return new Response(JSON.stringify({ 
      error: `Invalid type. Valid types: ${Object.keys(TARGETS).join(', ')}` 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Remove 'type' param before forwarding
  url.searchParams.delete('type');

  // Special handling for archive - year parameter
  if (type === 'archive') {
    const yearParam = url.searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : 2003;
    
    if (!ARCHIVE_VALID_YEARS.includes(year)) {
      return new Response(JSON.stringify({ 
        error: `Invalid year. Valid years: ${ARCHIVE_VALID_YEARS.join(', ')}` 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    url.searchParams.set('layers', `orto_${year}`);
    url.searchParams.delete('year');
  }

  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  });

  return handleWmsProxy(modifiedRequest, {
    targetUrl: TARGETS[type],
    serviceName: type.toUpperCase()
  });
}

