export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: {
    username: string;
    // add other user fields as needed
  };
} 