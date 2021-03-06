import { TestBed, inject } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

import { HomeChoseGuardService } from './home-chose-guard.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { UserAuthInfo } from '../model';

describe('HomeChoseGuardService', () => {
  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: any = jasmine.createSpyObj('HomeDefOdataService', ['fetchHomeMembers']);
    homeService.ChosedHome = {
      _id: 1,
      BaseCurrency: 'CNY',
    };
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        HomeChoseGuardService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should be created', inject([HomeChoseGuardService], (service: HomeChoseGuardService) => {
    expect(service).toBeTruthy();
  }));
});