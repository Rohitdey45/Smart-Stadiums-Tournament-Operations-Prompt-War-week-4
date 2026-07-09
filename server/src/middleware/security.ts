// Security wiring: hardened HTTP headers (Helmet + a strict CSP) and the
// RFC 9116 security.txt disclosure endpoint. Kept out of app.ts so the app
// module stays a thin composition root.
import type { RequestHandler } from 'express';
import helmet from 'helmet';

/**
 * RFC 9116 `security.txt` body advertising the coordinated-disclosure contact.
 * Served from an explicit route rather than static hosting so it is reachable
 * regardless of dotfile-serving quirks and is unit-testable without a build.
 */
export const SECURITY_TXT: string = [
  'Contact: mailto:usy.joseph@gmail.com',
  'Expires: 2027-01-01T00:00:00.000Z',
  'Preferred-Languages: en',
  'Canonical: https://stadiumiq-851755555005.asia-south1.run.app/.well-known/security.txt',
  '',
].join('\n');

/** Helmet configured for StadiumIQ's actual asset origins (strict CSP). */
export function securityHeaders(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // Stylesheets must be same-origin; only inline style *attributes*
        // (React's data-driven `style` prop) are allowed, not inline
        // <style> blocks — a tighter grant than a blanket 'unsafe-inline'.
        styleSrc: ["'self'"],
        styleSrcAttr: ["'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  });
}

/** Serves `/.well-known/security.txt` as uncached plain text (RFC 9116). */
export const securityTxtHandler: RequestHandler = (_req, res) => {
  res.type('text/plain');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(SECURITY_TXT);
};
