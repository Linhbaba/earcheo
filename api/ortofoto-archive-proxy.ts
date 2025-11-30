import { handleWmsProxy } from './_lib/edge-proxy';

// Edge Runtime config
export const config = {
  runtime: 'edge',
};

// Archivní ortofoto ČÚZK (1998-2024)
// Dostupné roky: 1998, 1999, 2000, 2001, 2003, 2004, 2005, 2006, 2007, 2008, 
//                2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 
//                2019, 2020, 2021, 2022, 2023, 2024
const ORTOFOTO_ARCHIVE_URL = 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_ARCHIV/WMService.aspx';

// Validní roky pro archivní ortofoto
const VALID_YEARS = [
  1998, 1999, 2000, 2001, 2003, 2004, 2005, 2006, 2007, 2008,
  2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
  2019, 2020, 2021, 2022, 2023, 2024
];

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Získat rok z query parametru (default: 2003 - první barevné snímky)
  const yearParam = url.searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : 2003;
  
  // Validace roku
  if (!VALID_YEARS.includes(year)) {
    return new Response(JSON.stringify({ 
      error: `Invalid year. Valid years: ${VALID_YEARS.join(', ')}` 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Nastavit správnou vrstvu podle roku
  // Formát vrstvy: orto_YYYY (např. orto_1998, orto_2003)
  url.searchParams.set('layers', `orto_${year}`);
  
  // Odstranit vlastní parametr 'year' před předáním ČÚZK
  url.searchParams.delete('year');
  
  // Vytvořit nový request s upravenými parametry
  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers: request.headers,
  });
  
  return handleWmsProxy(modifiedRequest, {
    targetUrl: ORTOFOTO_ARCHIVE_URL,
    serviceName: `Archivní Ortofoto ${year}`
  });
}


