import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MdIconRegistry } from '@angular/material';
import { TdLoadingService, LoadingType, ILoadingOptions } from '@covalent/core';
import { UIStatusService } from '../services/uistatus.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-learn',
  templateUrl: `./learn.component.html`,
  styleUrls: ['./learn.component.css']
})
export class LearnComponent implements OnInit {
  public isLoggedIn: boolean = false;
  public titleLogin: string;
  public routes: any;

  constructor(private _iconRegistry: MdIconRegistry,
    private _loadingService: TdLoadingService,
    private _domSanitizer: DomSanitizer,
    private _uistatus: UIStatusService,
    viewContainerRef: ViewContainerRef) { 

    // let options: ILoadingOptions = {
    //   name: 'main',
    //   type: LoadingType.Circular,
    // };
    // this._loadingService.createOverlayComponent(options, viewContainerRef);

    this._iconRegistry.addSvgIconInNamespace('assets', 'github',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/github.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'angular',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/angular.ico'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'covalent',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/covalent.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'covalent-mark',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/covalent-mark.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'hihlogo',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/hihapplogo.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'teradata-ux',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/teradata-ux.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'appcenter',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/appcenter.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'listener',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/listener.svg'));
    this._iconRegistry.addSvgIconInNamespace('assets', 'querygrid',
      this._domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/querygrid.svg'));

    // Register the UI status
    this._uistatus.obsTitleLogin.subscribe(x => {
      this.titleLogin = x;
    }, error => {

    }, () => {

    });

    this._uistatus.obsRouteList.subscribe(x => {
      this.routes = x;
    }, error => {

    }, () => {

    });
  }

  ngOnInit() {
  }
}
