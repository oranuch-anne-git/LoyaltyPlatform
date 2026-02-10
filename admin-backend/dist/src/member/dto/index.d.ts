export declare class CreateMemberDto {
    lineUserId?: string;
    name?: string;
    surname?: string;
    nationalType?: string;
    citizenId?: string;
    passport?: string;
    sex?: string;
    birthdate?: string;
    mobile?: string;
    email?: string;
    displayName?: string;
    channel?: string;
    memberLevelId?: string;
    consentPDPA?: boolean;
    addr_addressNo?: string;
    addr_building?: string;
    addr_road?: string;
    addr_soi?: string;
    addr_subdistrict?: string;
    addr_district?: string;
    addr_province?: string;
    addr_postalCode?: string;
}
export declare class UpdateMemberDto {
    name?: string;
    surname?: string;
    nationalType?: string;
    citizenId?: string;
    passport?: string;
    sex?: string;
    birthdate?: string;
    mobile?: string;
    email?: string;
    displayName?: string;
    memberLevelId?: string;
    addr_addressNo?: string;
    addr_building?: string;
    addr_road?: string;
    addr_soi?: string;
    addr_subdistrict?: string;
    addr_district?: string;
    addr_province?: string;
    addr_postalCode?: string;
    consentPDPA?: boolean;
    active?: boolean;
}
export declare class UpdateMemberLevelDto {
    name?: string;
    sortOrder?: number;
    privilegeDetail?: string;
}
