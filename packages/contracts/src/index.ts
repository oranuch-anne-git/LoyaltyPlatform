/**
 * Shared API contracts and types for Loyalty Platform.
 * Used by admin-backend and customer-backend to keep responses and DTOs in sync.
 */

// ----- Auth -----
export interface TokenResponse {
  access_token: string;
}

// ----- Location (Thailand: province, district, subdistrict by zip) -----
export interface LocationItem {
  id: string;
  code: string;
  nameTh: string;
  nameEn: string | null;
}

export interface SubdistrictItem extends LocationItem {
  zipCode: string | null;
}

export interface LocationByZipResponse {
  provinces: LocationItem[];
  districts: LocationItem[];
  subdistricts: SubdistrictItem[];
}

// ----- Member (minimal shapes for API responses) -----
export interface MemberLevelSummary {
  id: string;
  code: string;
  name: string;
}

export interface MemberProfile {
  id: string;
  memberId: string;
  crmId: string | null;
  firstName: string | null;
  lastName: string | null;
  nationalType: string | null;
  citizenId: string | null;
  passport: string | null;
  gender: string | null;
  birthdate: string | null;
  mobile: string | null;
  email: string | null;
  channel: string | null;
  pointBalance: number;
  levelCode: string | null;
  memberLevel?: MemberLevelSummary | null;
}

export interface MemberAddress {
  addr_addressNo: string | null;
  addr_building: string | null;
  addr_road: string | null;
  addr_soi: string | null;
  addr_moo: string | null;
  addr_subdistrict: string | null;
  addr_subdistrictCode: string | null;
  addr_district: string | null;
  addr_districtCode: string | null;
  addr_province: string | null;
  addr_provinceCode: string | null;
  addr_zipCode: string | null;
  addr_country: string | null;
}

// ----- API response envelope (customer-backend standard) -----
export interface ApiStatus {
  success: boolean;
  message: string;
}

export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  data: T;
}

// ----- API error (for consistent error responses) -----
export interface ApiErrorBody {
  message?: string;
  statusCode?: number;
  error?: string;
}
