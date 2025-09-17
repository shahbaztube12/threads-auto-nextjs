// Threads API client for handling authentication and API calls
export interface ThreadsUser {
  id: string
  username: string
  name?: string
  threads_profile_picture_url?: string
  threads_biography?: string
}

export interface ThreadsPost {
  id: string
  media_product_type: string
  media_type: string
  text?: string
  timestamp: string
  username: string
  permalink: string
}

export interface ThreadsTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

export class ThreadsAPIClient {
  private baseUrl = "https://graph.threads.net"
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  // Get user profile information
  async getUser(userId = "me"): Promise<ThreadsUser> {
    const response = await fetch(
      `${this.baseUrl}/${userId}?fields=id,username,name,threads_profile_picture_url,threads_biography&access_token=${this.accessToken}`,
    )

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`)
    }

    return response.json()
  }

  // Get user's threads/posts
  async getUserThreads(userId = "me", limit = 25): Promise<{ data: ThreadsPost[] }> {
    const response = await fetch(
      `${this.baseUrl}/${userId}/threads?fields=id,media_product_type,media_type,text,timestamp,username,permalink&limit=${limit}&access_token=${this.accessToken}`,
    )

    if (!response.ok) {
      throw new Error(`Failed to get threads: ${response.statusText}`)
    }

    return response.json()
  }

  // Create a new thread/post
  async createThread(text: string, mediaType = "TEXT"): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/me/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_type: mediaType,
        text: text,
        access_token: this.accessToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create thread: ${response.statusText}`)
    }

    return response.json()
  }

  // Reply to a thread
  async replyToThread(parentId: string, text: string): Promise<{ id: string }> {
    const response = await fetch(`${this.baseUrl}/me/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        media_type: "TEXT",
        text: text,
        reply_to_id: parentId,
        access_token: this.accessToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to reply to thread: ${response.statusText}`)
    }

    return response.json()
  }

  // Exchange short-lived token for long-lived token
  static async exchangeForLongLivedToken(shortLivedToken: string, clientSecret: string): Promise<ThreadsTokenResponse> {
    const response = await fetch(
      `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${clientSecret}&access_token=${shortLivedToken}`,
      { method: "GET" },
    )

    if (!response.ok) {
      throw new Error(`Failed to exchange token: ${response.statusText}`)
    }

    return response.json()
  }

  // Refresh long-lived token
  static async refreshLongLivedToken(accessToken: string, clientSecret: string): Promise<ThreadsTokenResponse> {
    const response = await fetch(
      `https://graph.threads.net/refresh_access_token?grant_type=th_refresh_token&access_token=${accessToken}&client_secret=${clientSecret}`,
      { method: "GET" },
    )

    if (!response.ok) {
      throw new Error(`Failed to refresh token: ${response.statusText}`)
    }

    return response.json()
  }
}
