export declare class CreateMemberDto {
    lineUserId?: string;
    crmId?: string;
    firstName?: string;
    lastName?: string;
    nationalType?: string;
    citizenId?: string;
    passport?: string;
    gender?: string;
    birthdate?: string;
    mobile?: string;
    email?: string;
    channel?: string;
    levelCode?: string;
    consentPDPA?: boolean;
    addr_addressNo?: string;
    addr_building?: string;
    addr_road?: string;
    addr_soi?: string;
    addr_moo?: string;
    addr_subdistrict?: string;
    addr_subdistrictCode?: string;
    addr_district?: string;
    addr_districtCode?: string;
    addr_province?: string;
    addr_provinceCode?: string;
    addr_zipCode?: string;
    addr_country?: string;
}
export declare class UpdateMemberDto {
    crmId?: string;
    firstName?: string;
    lastName?: string;
    nationalType?: string;
    citizenId?: string;
    passport?: string;
    gender?: string;
    birthdate?: string;
    mobile?: string;
    email?: string;
    levelCode?: string;
    addr_addressNo?: string;
    addr_building?: string;
    addr_road?: string;
    addr_soi?: string;
    addr_moo?: string;
    addr_subdistrict?: string;
    addr_subdistrictCode?: string;
    addr_district?: string;
    addr_districtCode?: string;
    addr_province?: string;
    addr_provinceCode?: string;
    addr_zipCode?: string;
    addr_country?: string;
    consentPDPA?: boolean;
    active?: boolean;
}
export declare class UpdateMemberLevelDto {
    name?: string;
    sortOrder?: number;
    privilegeTh?: string;
    privilegeEn?: string;
}
