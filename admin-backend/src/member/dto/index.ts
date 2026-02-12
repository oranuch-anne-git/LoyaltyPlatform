import { IsBoolean, IsDateString, IsEmail, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsOptional()
  @IsString()
  lineUserId?: string;

  @IsOptional()
  @IsString()
  crmId?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

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
  @IsIn(['1', '2']) // 1=Male, 2=Female
  gender?: string;

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
  channel?: string;

  @IsOptional()
  @IsString()
  levelCode?: string;

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
  addr_moo?: string;

  @IsOptional()
  @IsString()
  addr_subdistrict?: string;

  @IsOptional()
  @IsString()
  addr_subdistrictCode?: string;

  @IsOptional()
  @IsString()
  addr_district?: string;

  @IsOptional()
  @IsString()
  addr_districtCode?: string;

  @IsOptional()
  @IsString()
  addr_province?: string;

  @IsOptional()
  @IsString()
  addr_provinceCode?: string;

  @IsOptional()
  @IsString()
  addr_zipCode?: string;

  @IsOptional()
  @IsString()
  addr_country?: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  crmId?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

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
  @IsIn(['1', '2']) // 1=Male, 2=Female
  gender?: string;

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
  levelCode?: string;

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
  addr_moo?: string;

  @IsOptional()
  @IsString()
  addr_subdistrict?: string;

  @IsOptional()
  @IsString()
  addr_subdistrictCode?: string;

  @IsOptional()
  @IsString()
  addr_district?: string;

  @IsOptional()
  @IsString()
  addr_districtCode?: string;

  @IsOptional()
  @IsString()
  addr_province?: string;

  @IsOptional()
  @IsString()
  addr_provinceCode?: string;

  @IsOptional()
  @IsString()
  addr_zipCode?: string;

  @IsOptional()
  @IsString()
  addr_country?: string;

  @IsOptional()
  @IsBoolean()
  consentPDPA?: boolean;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateMemberLevelDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  privilegeTh?: string;

  @IsOptional()
  @IsString()
  privilegeEn?: string;
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
  privilegeTh?: string;

  @IsOptional()
  @IsString()
  privilegeEn?: string;
}
