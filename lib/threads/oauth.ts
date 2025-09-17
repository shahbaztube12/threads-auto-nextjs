// Threads OAuth helper functions
export function getThreadsAuthUrl(clientId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "threads_basic,threads_content_publish,threads_manage_insights",
    response_type: "code",
    ...(state && { state }),
  })

  return `https://threads.net/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<{
  access_token: string
  token_type: string
  expires_in?: number
}> {
  const response = await fetch("https://graph.threads.net/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to exchange code for token: ${response.statusText}`)
  }

  return response.json()
}
