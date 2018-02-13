import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { LogLevel, BookCategory, Book, Location, MovieGenre, Movie, MomentDateFormat } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

@Injectable()
export class LibraryStorageService {
  // Buffer
  private _isBookCtgyListLoaded: boolean;
  private _isMovieGenreListLoaded: boolean;
  private _isBookListLoaded: boolean;
  private _isLocationListLoaded: boolean;
  private _isMovieListLoaded: boolean;

  listBookCategoryChange: BehaviorSubject<BookCategory[]> = new BehaviorSubject<BookCategory[]>([]);
  get BookCategories(): BookCategory[] {
    return this.listBookCategoryChange.value;
  }
  listBookChange: BehaviorSubject<Book[]> = new BehaviorSubject<Book[]>([]);
  get Books(): Book[] {
    return this.listBookChange.value;
  }
  listLocationChange: BehaviorSubject<Location[]> = new BehaviorSubject<Location[]>([]);
  get Locations(): Location[] {
    return this.listLocationChange.value;
  }
  listMovieGenreChange: BehaviorSubject<MovieGenre[]> = new BehaviorSubject<MovieGenre[]>([]);
  get MovieGenres(): MovieGenre[] {
    return this.listMovieGenreChange.value;
  }
  listMovieChange: BehaviorSubject<Movie[]> = new BehaviorSubject<Movie[]>([]);
  get Movies(): Movie[] {
    return this.listMovieChange.value;
  }

  constructor(private _http: HttpClient,
    private _authService: AuthService,
    private _homeService: HomeDefDetailService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering LibraryStorageService constructor...');
    }

    this._isBookCtgyListLoaded = false;
    this._isMovieGenreListLoaded = false;
    this._isBookListLoaded = false;
    this._isLocationListLoaded = false;
    this._isMovieListLoaded = false;
  }

  // Book Categories
  public fetchAllBookCategories(forceReload?: boolean): Observable<any> {
    if (!this._isBookCtgyListLoaded || forceReload) {
      const apiurl: string = environment.ApiUrl + '/api/LibBookCategory';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllBookCategories in LibraryStorageService: ${response}`);
          }

          const rjs: any = <any>response;
          let listRst: BookCategory[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: BookCategory = new BookCategory();
              rst.onSetData(si);
              listRst.push(rst);
            }
          }

          // Prepare for the hierarchy
          this.buildBookCategoryHierarchy(listRst);
          // Sort it
          listRst.sort((a, b) => {
            return a.FullDisplayText.localeCompare(b.FullDisplayText);
          });

          this._isBookCtgyListLoaded = true;
          this.listBookCategoryChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllBookCategories in LibraryStorageService: ${error}`);
          }

          this._isBookCtgyListLoaded = false;
          this.listBookCategoryChange.next([]);

          return Observable.throw(error.statusText + '; ' + error.error + '; ' + error.message);
        });
    } else {
      return Observable.of(this.listBookCategoryChange.value);
    }
  }
  private buildBookCategoryHierarchy(listCtgy: BookCategory[]) {
    listCtgy.forEach((value, index, array) => {
      if (!value.ParentID) {
        value.HierLevel = 0;
        value.FullDisplayText = value.Name;

        this.buildBookCategoryHiercharyImpl(value, listCtgy, 1);
      }
    });
  }
  private buildBookCategoryHiercharyImpl(par: BookCategory, listCtgy: BookCategory[], curLevel: number) {
    listCtgy.forEach((value, index, array) => {
      if (value.ParentID === par.ID) {
        value.HierLevel = curLevel;
        value.FullDisplayText = par.FullDisplayText + '.' + value.Name;

        this.buildBookCategoryHiercharyImpl(value, listCtgy, value.HierLevel + 1);
      }
    });
  }

  // Location
  public fetchAllLocations(forceReload?: boolean): Observable<any> {
    if (!this._isLocationListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/LibLocation';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllLocations in LibraryStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst: Location[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Location = new Location();
              //rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isLocationListLoaded = true;
          this.listLocationChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllLocations in LibraryStorageService: ${error}`);
          }

          this._isLocationListLoaded = false;
          this.listLocationChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listLocationChange.value);
    }
  }

  // Book
  public fetchAllBooks(forceReload?: boolean): Observable<any> {
    if (!this._isBookListLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/LibBook';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllBooks in LibraryStorageService: ${response}`);
          }

          const rjs = <any>response;
          let listRst: Book[] = [];

          if (rjs.totalCount > 0 && rjs.contentList instanceof Array && rjs.contentList.length > 0) {
            for (const si of rjs.contentList) {
              const rst: Book = new Book();
              //rst.onSetData(si);
              listRst.push(rst);
            }
          }

          this._isBookListLoaded = true;
          this.listBookChange.next(listRst);
          return listRst;
        })
        .catch((error: HttpErrorResponse) => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllBooks in LibraryStorageService: ${error}`);
          }

          this._isBookListLoaded = false;
          this.listBookChange.next([]);

          return Observable.throw(error.statusText + "; " + error.error + "; " + error.message);
        });
    } else {
      return Observable.of(this.listLocationChange.value);
    }
  }  
}
