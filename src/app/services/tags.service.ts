import { Injectable, EventEmitter } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { Observable, BehaviorSubject } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { LogLevel, Tag, TagCount, TagTypeEnum } from '../model';
import { AuthService } from './auth.service';
import { HomeDefDetailService } from './home-def-detail.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';

@Injectable()
export class TagsService {
  // listDataChange: BehaviorSubject<Tag[]> = new BehaviorSubject<Tag[]>([]);
  // get Tags(): Tag[] {
  //   return this.listDataChange.value;
  // }

  // private _islistLoaded: boolean;

  constructor(private _http: HttpClient,
    private _homeService: HomeDefDetailService,
    private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering TagsService constructor...');
    }

    //this._islistLoaded = false; // Performance improvement
  }

  public fetchAllTags(
    //forceReload?: boolean
    reqamt: boolean,
    tagtype?: TagTypeEnum,
    tagterm?: string
  ): Observable<TagCount[] | Tag[]> {
    //if (!this._islistLoaded || forceReload) {
      const apiurl = environment.ApiUrl + '/api/Tag';

      let headers = new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json')
                .append('Accept', 'application/json')
                .append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());

      let params: HttpParams = new HttpParams();
      params = params.append('hid', this._homeService.ChosedHome.ID.toString());
      params = params.append('reqamt', (<boolean>reqamt).toString());
      if (tagtype) {
        params = params.append('tagtype', (<number>tagtype).toString());
      }
      if (tagterm) {
        params = params.append('tagterm', tagterm);
      }
      return this._http.get(apiurl, {
          headers: headers,
          params: params,
          withCredentials: true,
        })
        .map((response: HttpResponse<any>) => {
          if (environment.LoggingLevel >= LogLevel.Debug) {
            console.log(`AC_HIH_UI [Debug]: Entering map in fetchAllTags in TagsService: ${response}`);
          }

          let listCountRst: TagCount[] = [];
          let listRst: Tag[] = [];
          const rjs = <any>response;

          for (const si of rjs) {
            if (reqamt) {
              let tc: TagCount = new TagCount();
              tc.onSetData(si);
              listCountRst.push(tc);
            } else {
              let tag: Tag = new Tag();
              tag.onSetData(si);
              listRst.push(tag);
            }
          }

          // this._islistLoaded = true;
          // this.listDataChange.next(listRst);

          return reqamt? listCountRst : listRst;
        })
        .catch(err => {
          if (environment.LoggingLevel >= LogLevel.Error) {
            console.error(`AC_HIH_UI [Error]: Failed in fetchAllTags in TagsService: ${err}`);
          }

          // this._islistLoaded = false;
          // this.listDataChange.next([]);

          return Observable.throw(err.json());
        });
    // } else {
    //   return Observable.of(this.listDataChange.value);
    // }
  }
}