export interface Team {
  name: string;
  city: string;
  state: string;
  logo: string | null;
  isMale: string;
  official: string;
  added: string;
  modified: string;
  deleted:string;
}

export interface ServerTeam {
  name: string;
  city: string;
  state: string;
  logo: string | null;
  isMale: boolean;
  official: boolean;
}
