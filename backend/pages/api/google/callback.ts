import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res.status(200).end()
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', 'https://velora-beta-one.vercel.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'GET') {
    const { code, error } = req.query;

    if (error) {
      console.error('OAuth error:', error);
      // Redirect back to the app with error
      res.redirect(`${process.env.FRONTEND_URL || 'https://velora-beta-one.vercel.app'}/chat?error=oauth_error`);
      return;
    }

    if (!code) {
      console.error('No authorization code received');
      res.redirect(`${process.env.FRONTEND_URL || 'https://velora-beta-one.vercel.app'}/chat?error=no_code`);
      return;
    }

    try {
      // Exchange the code for tokens
      const tokenResponse = await fetch(`${process.env.APP_URL || 'https://velora-production.up.railway.app'}/api/google/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const { tokens } = await tokenResponse.json();

      // Close the popup and send tokens to parent window
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Google OAuth Success</title>
        </head>
        <body>
          <script>
            // Send tokens to parent window
            if (window.opener) {
              window.opener.postMessage({
                type: 'GOOGLE_OAUTH_SUCCESS',
                tokens: ${JSON.stringify(tokens)}
              }, '*');
              window.close();
            } else {
              // Fallback: redirect to main app
              window.location.href = '${process.env.FRONTEND_URL || 'https://velora-beta-one.vercel.app'}/chat?success=google_connected';
            }
          </script>
          <p>Google Workspace connected successfully! You can close this window.</p>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'https://velora-beta-one.vercel.app'}/chat?error=callback_error`);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
