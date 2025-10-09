import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { Bike } from '../_models/bike';
import { BikeService } from '../_services/bike.service';

export const bikeResolver: ResolveFn<Bike> = (route) => {
  const bikeService = inject(BikeService);

  return bikeService.getBike(Number(route.paramMap.get('id')!))
};


