const MARATHON_SECRET_KEY = process.env.MARATHON_SECRET_KEY || 'ducbm900966559155';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Auto inject secret key for Google Apps Script if missing
  if (targetUrl.includes('script.google.com') && !targetUrl.includes('key=') && !targetUrl.includes('token=')) {
    try {
      const u = new URL(targetUrl);
      u.searchParams.set('key', MARATHON_SECRET_KEY);
      targetUrl = u.toString();
    } catch {
      // ignore
    }
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json();
      return res.json(json);
    }
    const text = await response.text();
    return res.send(text);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
