export interface Team {
  name: string;
  city: string;
  state: string;
  logo: string | null;
  isMale: number;
  official: number;
}

export interface ServerTeam {
  name: string;
  city: string;
  state: string;
  logo: string | null;
  isMale: boolean;
  official: boolean;
}
