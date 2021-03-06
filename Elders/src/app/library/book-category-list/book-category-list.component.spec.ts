import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpLoaderTestFactory } from '../../../../../src/testing';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { BookCategoryListComponent } from './book-category-list.component';
import { LibraryStorageService } from 'app/services';

describe('BookCategoryListComponent', () => {
  let component: BookCategoryListComponent;
  let fixture: ComponentFixture<BookCategoryListComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  // let stgserviceStub: Partial<LibraryStorageService>;

  beforeEach(async(() => {
    // Create a spy
    const stgservice: any = jasmine.createSpyObj('LibraryStorageService', ['fetchAllBookCategories']);
    // Make the spy return a synchronous Observable with the test data
    const fetchAllBookCategoriesSpy: any = stgservice.fetchAllBookCategories.and.returnValue( of([]) );
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        BookCategoryListComponent,
      ],
      providers: [
        TranslateService,
        { provide: LibraryStorageService, useValue: stgservice },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCategoryListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);

    fixture.detectChanges();
  });

  it('1. should be created', () => {
    expect(component).toBeTruthy();
  });
});
