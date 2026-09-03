export default async function handler(req, res) {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  // Optional: validate state parameter against cookie
  const cookies = req.headers.cookie || '';
  const storedState = cookies.split(';').find(function (c) {
    return c.trim().indexOf('oauth_state=') === 0;
  });
  const expectedState = storedState ? storedState.split('=')[1] : null;

  if (state && expectedState && state !== expectedState) {
    return res.status(400).send('Invalid state parameter');
  }

  // Clear state cookie
  res.setHeader('Set-Cookie', 'oauth_state=; Max-Age=0; path=/; SameSite=Lax');

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).send('GitHub OAuth error: ' + (data.error_description || data.error));
    }

    if (!data.access_token) {
      return res.status(400).send('No access token received from GitHub');
    }

    res.redirect(302, '/contribute/contri.html?token=' + encodeURIComponent(data.access_token));
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('Internal server error');
  }
}
