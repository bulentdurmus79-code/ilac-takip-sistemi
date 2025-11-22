import { google } from 'googleapis';

export class CalendarService {
  private static instance: CalendarService;

  public static getInstance(): CalendarService {
    if (!CalendarService.instance) {
      CalendarService.instance = new CalendarService();
    }
    return CalendarService.instance;
  }

  async getAuthenticatedClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth: oauth2Client });
  }

  async createEvent(accessToken: string, calendarId: 'primary' = 'primary', eventData: {
    summary: string;
    description?: string;
    start: { dateTime: string };
    end: { dateTime: string };
    reminders?: { useDefault: boolean };
  }) {
    const calendar = await this.getAuthenticatedClient(accessToken);
    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventData,
    });
    return response.data;
  }

  async updateEvent(accessToken: string, calendarId: 'primary' = 'primary', eventId: string, eventData: Partial<{
    summary: string;
    description?: string;
    start: { dateTime: string };
    end: { dateTime: string };
    reminders?: { useDefault: boolean };
  }>) {
    const calendar = await this.getAuthenticatedClient(accessToken);
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: eventData,
    });
    return response.data;
  }

  async deleteEvent(accessToken: string, calendarId: 'primary' = 'primary', eventId: string) {
    const calendar = await this.getAuthenticatedClient(accessToken);
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  }
}

export const calendarService = CalendarService.getInstance();
