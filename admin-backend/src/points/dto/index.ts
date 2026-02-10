import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class EarnPointsDto {
  @IsString()
  memberId: string;

  @IsInt()
  @Min(1)
  points: number;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class RedeemPointsDto {
  @IsString()
  memberId: string;

  @IsInt()
  @Min(1)
  points: number;

  @IsOptional()
  @IsString()
  rewardId?: string;

  @IsOptional()
  @IsString()
  referenceId?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  metadata?: string;
}

export class AdjustPointsDto {
  @IsString()
  memberId: string;

  @IsInt()
  points: number; // can be negative

  @IsOptional()
  @IsString()
  reason?: string;
}
