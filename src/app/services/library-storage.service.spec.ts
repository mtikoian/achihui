import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { LibraryStorageService } from './library-storage.service';
import { AuthService } from './auth.service';
import { HomeDefOdataService } from './home-def-odata.service';
import { UserAuthInfo } from '../model';
import { environment } from '../../environments/environment';
import { FakeDataHelper } from '../../testing';

describe('LibraryStorageService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let fakeData: FakeDataHelper;
  let service: LibraryStorageService;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildLibBookCategoriesFromAPI();
    fakeData.buildLibMovieGenresFromAPI();
    fakeData.buildLibLocationsFromAPI();
  });

  beforeEach(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(fakeData.currentUser);
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        LibraryStorageService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
      ],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', () => {
    service = TestBed.get(LibraryStorageService);
    expect(service).toBeTruthy();
  });

  /// LibraryStorageService method tests begin ///
  describe('fetchAllBookCategories', () => {
    beforeEach(() => {
      service = TestBed.get(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected bookCategories (called once)', () => {
      expect(service.BookCategories.length).toEqual(0, 'should not buffered yet');

      service.fetchAllBookCategories().subscribe(
        (ctgies: any) => {
          expect(ctgies.length).toEqual(fakeData.libBookCategoriesFromAPI.length, 'should return expected book categories');
          expect(service.BookCategories.length).toEqual(fakeData.libBookCategoriesFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET bookCategories from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock bookCategories
      req.flush(fakeData.libBookCategoriesFullReplyFromAPI);
    });

    it('should be OK returning no bookCategories', () => {
      expect(service.BookCategories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllBookCategories().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(0, 'should have empty bookCategories array');
          expect(service.BookCategories.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllBookCategories().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected bookCategories (called multiple times)', () => {
      expect(service.BookCategories.length).toEqual(0, 'should not buffered yet');
      service.fetchAllBookCategories().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.libBookCategoriesFromAPI.length, 'should return expected book categories');
          expect(curries.length).toEqual(service.BookCategories.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush(fakeData.libBookCategoriesFullReplyFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllBookCategories().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllBookCategories().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.libBookCategoriesFromAPI.length, 'should return expected book categories');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.bookCategoryAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllMovieGenres', () => {
    beforeEach(() => {
      service = TestBed.get(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected movie genres (called once)', () => {
      expect(service.MovieGenres.length).toEqual(0, 'should not buffered yet');

      service.fetchAllMovieGenres().subscribe(
        (ctgies: any) => {
          expect(ctgies.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should return expected movie genres');
          expect(service.MovieGenres.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock bookCategories
      req.flush(fakeData.libMovieGenresFullReplyFromAPI);
    });

    it('should be OK returning empty data', () => {
      expect(service.MovieGenres.length).toEqual(0, 'should not buffered yet');
      service.fetchAllMovieGenres().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(0, 'should have empty data array');
          expect(service.MovieGenres.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllMovieGenres().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
       });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected data (called multiple times)', () => {
      expect(service.MovieGenres.length).toEqual(0, 'should not buffered yet');
      service.fetchAllMovieGenres().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should return expected data');
          expect(curries.length).toEqual(service.MovieGenres.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush(fakeData.libMovieGenresFullReplyFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllMovieGenres().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
       });
      expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllMovieGenres().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.libMovieGenresFromAPI.length, 'should return expected data');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.movieGenreAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });

  describe('fetchAllLocations', () => {
    beforeEach(() => {
      service = TestBed.get(LibraryStorageService);
    });
    afterEach(() => {
      // After every test, assert that there are no more pending requests.
      httpTestingController.verify();
    });

    it('should return expected locations (called once)', () => {
      expect(service.Locations.length).toEqual(0, 'should not buffered yet');

      service.fetchAllLocations().subscribe(
        (ctgies: any) => {
          expect(ctgies.length).toEqual(fakeData.libLocationsFromAPI.length, 'should return expected data');
          expect(service.Locations.length).toEqual(fakeData.libLocationsFromAPI.length, 'should have buffered');
        },
        (fail: any) => {
          // Empty
        },
      );

      // Service should have made one request to GET data from expected URL
      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());

      // Respond with the mock bookCategories
      req.flush(fakeData.libLocationsFullReplyFromAPI);
    });

    it('should be OK returning empty data', () => {
      expect(service.Locations.length).toEqual(0, 'should not buffered yet');
      service.fetchAllLocations().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(0, 'should have empty data array');
          expect(service.Locations.length).toEqual(0, 'should buffered nothing');
        },
        (fail: any) => {
          // Empty
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
       });
      expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
      req.flush({}); // Respond with no data
    });

    it('should return error in case error appear', () => {
      const msg: string = 'Deliberate 404';
      service.fetchAllLocations().subscribe(
        (curries: any) => {
          fail('expected to fail');
        },
        (error: any) => {
          expect(error).toContain(msg);
        },
      );

      const req: any = httpTestingController.expectOne((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
       });

      // respond with a 404 and the error message in the body
      req.flush(msg, { status: 404, statusText: 'Not Found' });
    });

    it('should return expected data (called multiple times)', () => {
      expect(service.Locations.length).toEqual(0, 'should not buffered yet');
      service.fetchAllLocations().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.libLocationsFromAPI.length, 'should return expected data');
          expect(curries.length).toEqual(service.Locations.length, 'should have buffered');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
       });
      expect(reqs.length).toEqual(1, 'shall be only 1 calls to real API!');
      reqs[0].flush(fakeData.libLocationsFullReplyFromAPI);
      httpTestingController.verify();

      // Second call
      service.fetchAllLocations().subscribe();
      const reqs2: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
       });
      expect(reqs2.length).toEqual(0, 'shall be 0 calls to real API due to buffer!');

      // Third call
      service.fetchAllLocations().subscribe(
        (curries: any) => {
          expect(curries.length).toEqual(fakeData.libLocationsFromAPI.length, 'should return expected data');
        },
        (fail: any) => {
          // Do nothing
        },
      );
      const reqs3: any = httpTestingController.match((requrl: any) => {
        return requrl.method === 'GET' && requrl.url === service.locationAPIURL && requrl.params.has('hid');
       });
      expect(reqs3.length).toEqual(0, 'shall be 0 calls to real API in third call!');
    });
  });
});