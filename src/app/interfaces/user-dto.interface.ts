export interface UserDto {
  userId: number;
  role: number;
  userName: string | null;
  email: string;
  phone: string | null;
  emailConfirmed: boolean;
  phoneConfirmed: boolean;
  firstName: string | null;
  lastName: string | null;
}
