import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, } from '../../../../../src/testing';
import { ControlCenterTreeComponent } from './control-center-tree.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

@Component({selector: 'hih-fin-docitem-by-cc', template: ''})
class DocItemByCCComponent {
  @Input() selectedControlCenter: any;
  @Input() selectedScope: any;
}

describe('ControlCenterTreeComponent', () => {
  let component: ControlCenterTreeComponent;
  let fixture: ComponentFixture<ControlCenterTreeComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllControlCentersSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinControlCenter();
  });

  beforeEach(async(() => {
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllControlCenters']);
    fetchAllControlCentersSpy = storageService.fetchAllControlCenters.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        DocItemByCCComponent,
        ControlCenterTreeComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: FinanceStorageService, useValue: storageService },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterTreeComponent);
    component = fixture.componentInstance;
  });

  it('1. should create withou data', () => {
    expect(component).toBeTruthy();
  });

  describe('should work with the data', () => {
    beforeEach(() => {
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
    });

    it('shall load the data',  fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(fetchAllControlCentersSpy).toHaveBeenCalled();
      expect(component.dataSource.data.length).toBeGreaterThan(0);
    }));
  });
});
