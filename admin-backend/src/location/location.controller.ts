import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocationService } from './location.service';

@Controller('api')
@UseGuards(AuthGuard('jwt'))
export class LocationController {
  constructor(private location: LocationService) {}

  @Get('provinces')
  getProvinces() {
    return this.location.getProvinces();
  }

  @Get('districts')
  getDistricts(@Query('provinceCode') provinceCode: string) {
    return this.location.getDistricts(provinceCode || '');
  }

  @Get('subdistricts')
  getSubdistricts(@Query('districtId') districtId: string) {
    return this.location.getSubdistricts(districtId || '');
  }

  @Get('by-zip')
  getByZipCode(@Query('zipCode') zipCode: string) {
    return this.location.getByZipCode(zipCode || '');
  }
}
