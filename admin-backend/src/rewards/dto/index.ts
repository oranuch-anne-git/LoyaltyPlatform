import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRewardDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  partnerId?: string;

  @IsInt()
  @Min(0)
  pointCost: number;

  @IsOptional()
  @IsInt()
  @Min(-1)
  quantity?: number;

  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  validTo?: Date;
}

export class UpdateRewardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pointCost?: number;

  @IsOptional()
  @IsInt()
  @Min(-1)
  quantity?: number;

  @IsOptional()
  @Type(() => Date)
  validFrom?: Date;

  @IsOptional()
  @Type(() => Date)
  validTo?: Date;

  @IsOptional()
  active?: boolean;
}

export class RedeemRewardDto {
  @IsString()
  memberId: string;

  @IsString()
  rewardId: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}
