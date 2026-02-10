import { IsBoolean, IsDateString, IsEmail, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsOptional()
  @IsString()
  lineUserId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsIn(['THAI', 'OTHER'])
  nationalType?: string;

  @IsOptional()
  @IsString()
  citizenId?: string;

  @IsOptional()
  @IsString()
  passport?: string;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  memberLevelId?: string;

  @IsOptional()
  @IsBoolean()
  consentPDPA?: boolean;

  // Address (addr_ prefix)
  @IsOptional()
  @IsString()
  addr_addressNo?: string;

  @IsOptional()
  @IsString()
  addr_building?: string;

  @IsOptional()
  @IsString()
  addr_road?: string;

  @IsOptional()
  @IsString()
  addr_soi?: string;

  @IsOptional()
  @IsString()
  addr_subdistrict?: string;

  @IsOptional()
  @IsString()
  addr_district?: string;

  @IsOptional()
  @IsString()
  addr_province?: string;

  @IsOptional()
  @IsString()
  addr_postalCode?: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsOptional()
  @IsIn(['THAI', 'OTHER'])
  nationalType?: string;

  @IsOptional()
  @IsString()
  citizenId?: string;

  @IsOptional()
  @IsString()
  passport?: string;

  @IsOptional()
  @IsString()
  sex?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  memberLevelId?: string;

  @IsOptional()
  @IsString()
  addr_addressNo?: string;

  @IsOptional()
  @IsString()
  addr_building?: string;

  @IsOptional()
  @IsString()
  addr_road?: string;

  @IsOptional()
  @IsString()
  addr_soi?: string;

  @IsOptional()
  @IsString()
  addr_subdistrict?: string;

  @IsOptional()
  @IsString()
  addr_district?: string;

  @IsOptional()
  @IsString()
  addr_province?: string;

  @IsOptional()
  @IsString()
  addr_postalCode?: string;

  @IsOptional()
  @IsBoolean()
  consentPDPA?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateMemberLevelDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  privilegeDetail?: string;
}
