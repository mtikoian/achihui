import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject, merge, of, throwError } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, AppLanguage, ModelUtility, ConsoleLogTypeEnum } from '../model';

@Injectable()
export class LanguageOdataService {
  // Buffer
  private _islistLoaded: boolean;
  private _listData: AppLanguage[];
  get Languages(): AppLanguage[] {
    return this._listData;
  }

  constructor(private _http: HttpClient) {
    ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering LanguageService constructor...', ConsoleLogTypeEnum.debug);

    this._islistLoaded = false; // Performance improvement
    this._listData = [];
  }

  public fetchAllLanguages(): Observable<AppLanguage[]> {
    if (!this._islistLoaded) {
      const apiurl: string = environment.ApiUrl + '/api/Languages';

      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                       .append('Accept', 'application/json');

      return this._http.get(apiurl, {
          headers,
        })
        .pipe(map((response: HttpResponse<any>) => {
          ModelUtility.writeConsoleLog('AC_HIH_UI [Debug]: Entering map in fetchAllLanguages in LanguageService', ConsoleLogTypeEnum.debug);

          const rjs: any = response as any;
          this._listData = [];

          if (rjs instanceof Array && rjs.length > 0) {
            for (const si of rjs) {
              const hd: AppLanguage = new AppLanguage();
              hd.onSetData(si);
              this._listData.push(hd);
            }
          }
          this._islistLoaded = true;

          return this._listData;
        }),
        catchError((error: HttpErrorResponse) => {
          ModelUtility.writeConsoleLog(`AC_HIH_UI [Error]: Failed in fetchAllLanguages in LanguageService: ${error}`,
            ConsoleLogTypeEnum.error);

          this._islistLoaded = false;
          this._listData = [];

          return throwError(error.statusText + '; ' + error.error + '; ' + error.message);
        }));
    } else {
      return of(this._listData);
    }
  }
}
