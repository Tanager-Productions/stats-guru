export interface Event {
  eventId: number;
  startDate: string | null;
  endDate: string | null;
  state: string | null;
  title: string | null;
  city: string | null;
  picture: string | null;
}

export interface ServerEvent {
  eventId: number;
  startDate: string | null;
  endDate: string | null;
  state: string | null;
  title: string | null;
  city: string | null;
  picture: string | null;
}
