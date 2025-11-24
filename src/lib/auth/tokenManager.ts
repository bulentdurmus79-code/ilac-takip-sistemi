// TOKEN MANAGER CLASS - Önerilen kritik özellik
import { getSession, signIn } from 'next-auth/react';

export interface AuthSession {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

class TokenManager {
  private refreshTokenTimer: NodeJS.Timeout | null = null;
  private readonly REFRESH_BUFFER_TIME = 50 * 60 * 1000; // 50 dakika

  // Geçerli token'ı al, süresi dolduysa yenile
  async getValidToken(): Promise<string> {
    try {
      const session = await getSession() as any;

      if (!session?.accessToken) {
        console.error('❌ No access token available');
        throw new Error('Oturum geçerli değil. Tekrar giriş yapın.');
      }

      // Token süresi dolduysa yenile
      if (this.isTokenExpired(session.accessToken)) {
        console.log('🔄 Token expired, refreshing...');
        return await this.refreshAccessToken(session.refreshToken);
      }

      return session.accessToken;
    } catch (error) {
      console.error('❌ Token validation failed:', error);
      throw error;
    }
  }

  // JWT token'ın expiry'sini kontrol et
  private isTokenExpired(token: string): boolean {
    try {
      // Simple JWT decode (client-side)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // seconds to milliseconds

      return Date.now() >= (expiryTime - this.REFRESH_BUFFER_TIME);
    } catch (error) {
      console.error('Token decode error:', error);
      return true; // Güvenlik için expired varsay
    }
  }

  // Refresh token ile yeni access token al
  private async refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshToken) {
      throw new Error('Refresh token mevcut değil');
    }

    try {
      // OAuth 2.0 token refresh endpoint
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!, // Public env var
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Token refresh failed:', error);
        throw new Error('Token yenilenemedi. Tekrar giriş yapın.');
      }

      const tokenData = await response.json();

      // Yeni session'ı güncelle
      await this.updateSessionWithNewTokens(tokenData);

      return tokenData.access_token;
    } catch (error) {
      console.error('❌ Token refresh error:', error);

      // Refresh başarısızsa yeni login zorunlu
      if (typeof window !== 'undefined') {
        await signIn('google', { callbackUrl: window.location.pathname });
      }

      throw error;
    }
  }

  // Session'ı yeni token bilgileri ile güncelle
  private async updateSessionWithNewTokens(tokenData: any) {
    // Browser localStorage'da session'ı güncelle
    try {
      const currentSession = localStorage.getItem('next-auth.session-token');

      if (currentSession) {
        // Yeni token bilgileri ile update
        const updatedSessionData = {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || undefined,
          accessTokenExpires: Date.now() + (tokenData.expires_in * 1000),
        };

        // Force session update
        if (typeof window !== 'undefined') {
          // NextAuth session yeniden yüklettir
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Session update error:', error);
    }
  }

  // Otomatik token yenilemeyi başlat
  startAutoRefresh() {
    // Her 50 dakikada bir token kontrolü
    this.refreshTokenTimer = setInterval(async () => {
      try {
        const session = await getSession() as any;

        if (session?.refreshToken) {
          // Token yakında expire olacak mı kontrol et
          const accessToken = session.accessToken;
          if (accessToken && this.isTokenExpired(accessToken)) {
            console.log('🔄 Auto-refreshing token...');
            await this.refreshAccessToken(session.refreshToken);
          }
        }
      } catch (error) {
        console.error('Auto-token refresh failed:', error);
      }
    }, this.REFRESH_BUFFER_TIME);
  }

  // Otomatik refresh'i durdur
  stopAutoRefresh() {
    if (this.refreshTokenTimer) {
      clearInterval(this.refreshTokenTimer);
      this.refreshTokenTimer = null;
    }
  }

  // Mevcut session bilgilerini al
  async getSessionInfo() {
    const session = await getSession() as any;
    return {
      hasAccessToken: !!session?.accessToken,
      hasRefreshToken: !!session?.refreshToken,
      isExpired: session?.accessToken ? this.isTokenExpired(session.accessToken) : true,
      nextRefresh: new Date(Date.now() + this.REFRESH_BUFFER_TIME).toLocaleString('tr-TR'),
    };
  }

  // Yeni session başlat (login sonrası)
  async initializeNewSession() {
    try {
      // İlk token kontrolü
      const token = await this.getValidToken();
      console.log('✅ Token initialized:', token.substring(0, 10) + '...');

      // Otomatik refresh başlat
      this.startAutoRefresh();
      console.log('🔄 Auto refresh started');
    } catch (error) {
      console.error('❌ Session initialization failed:', error);
      throw error;
    }
  }
}

export const tokenManager = new TokenManager();
