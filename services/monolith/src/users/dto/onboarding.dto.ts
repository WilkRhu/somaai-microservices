import { IsOptional, IsString, IsNumber } from 'class-validator';

export class OnboardingDto {
  @IsOptional()
  @IsNumber()
  netIncome?: number;

  @IsOptional()
  @IsString()
  profession?: string;
}

export class OnboardingStatusDto {
  completed: boolean;
  steps: {
    profileComplete: boolean;
    addressComplete: boolean;
    cardComplete: boolean;
    onboardingComplete: boolean;
  };
}
