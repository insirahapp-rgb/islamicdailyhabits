export interface UserProfile {
  name: string;
  birthDate: string | null;
  gender: 'male' | 'female' | null;
  expectedAge: number;
  onboardingCompleted: boolean;
  createdAt: string | null;
}
