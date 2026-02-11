import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocationService } from './location.service';

@Controller('api/location')
@UseGuards(AuthGuard('jwt'))
export class LocationController {
  constructor(private readonly location: LocationService) {}

  /** List provinces by zip code (provinces that have subdistricts with this postal code). */
  @Get('provinces')
  getProvincesByZipCode(
    @Query('zipCode') zipCode: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.location.getProvincesByZipCode(zipCode || '', authorization);
  }

  /** List districts by zip code (districts that have subdistricts with this postal code). */
  @Get('districts')
  getDistrictsByZipCode(
    @Query('zipCode') zipCode: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.location.getDistrictsByZipCode(zipCode || '', authorization);
  }

  /** List subdistricts by zip code. */
  @Get('subdistricts')
  getSubdistrictsByZipCode(
    @Query('zipCode') zipCode: string,
    @Headers('authorization') authorization?: string,
  ) {
    return this.location.getSubdistrictsByZipCode(zipCode || '', authorization);
  }
}
