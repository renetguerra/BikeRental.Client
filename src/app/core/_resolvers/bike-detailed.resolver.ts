import { ResolveFn } from '@angular/router';
import { Member } from '../_models/member';
import { inject } from '@angular/core';
import { MembersService } from '../_services/members.service';
import { Bike } from '../_models/bike';
import { BikeService } from '../_services/bike.service';

export const bikeDetailedResolver: ResolveFn<Bike> = (route, state) => {
  const bikeService = inject(BikeService);

  return bikeService.getBike(Number(route.paramMap.get('id')!))
};
