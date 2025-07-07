import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get IP dari headers Vercel/CloudFlare
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
    const cfConnectingIp = request.headers.get('cf-connecting-ip'); 
    const userAgent = request.headers.get('user-agent');
    
    // Get external IP via service  
    let externalIp = null;
    let ipifyError = null;
    
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        externalIp = ipData.ip;
      }
    } catch (error) {
      ipifyError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Get IP dari multiple services untuk cross-check
    let ipapiIp = null;
    try {
      const ipapiResponse = await fetch('https://ipapi.co/ip/');
      if (ipapiResponse.ok) {
        ipapiIp = await ipapiResponse.text();
        ipapiIp = ipapiIp.trim();
      }
    } catch (error) {
      // Silent fail for backup service
    }

    const result = {
      status: 'success',
      timestamp: new Date().toISOString(),
      vercel_headers: {
        'x-forwarded-for': forwarded,
        'x-real-ip': realIp,
        'x-vercel-forwarded-for': vercelForwardedFor,
        'cf-connecting-ip': cfConnectingIp
      },
      external_ip_services: {
        ipify: externalIp,
        ipapi: ipapiIp,
        ipify_error: ipifyError
      },
      user_agent: userAgent,
      recommended_whitelist_ips: [
        externalIp,
        ipapiIp,
        forwarded?.split(',')[0]?.trim(),
        realIp,
        vercelForwardedFor?.split(',')[0]?.trim(),
        cfConnectingIp
      ].filter(Boolean), // Remove null/undefined values
      note: 'Vercel uses dynamic IPs. Consider using webhook signature verification instead of IP whitelisting.'
    };

    console.log('🌐 IP Check requested:', {
      external_ip: externalIp,
      forwarded: forwarded,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Error checking IP:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 