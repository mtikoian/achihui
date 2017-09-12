import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog } from '@angular/material';
import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, UIMode } from '../../model';
import { HomeDefDetailService, FinanceStorageService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';

@Component({
  selector: 'app-control-center-detail',
  templateUrl: './control-center-detail.component.html',
  styleUrls: ['./control-center-detail.component.scss'],
})
export class ControlCenterDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: ControlCenter | null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;

  constructor(private _dialog: MdDialog, 
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
      this.detailObject = new ControlCenter();
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit...');
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering ControlCenterDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.currentMode = 'Common.Create';
          this.detailObject = new ControlCenter();
          this.uiMode = UIMode.Create;
          this.detailObject.HID = this._homedefService.ChosedHome.ID;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.currentMode = 'Common.Edit';
          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.currentMode = 'Common.Display';
          this.uiMode = UIMode.Display;
        }

        if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
          this._storageService.readControlCenterEvent.subscribe(x => {
            if (x instanceof ControlCenter) {
              if (environment.LoggingLevel >= LogLevel.Debug) {
                console.log(`AC_HIH_UI [Debug]: Entering ngOninit in ControlCenterDetailComponent, succeed to readControlCenterEvent : ${x}`);
              }
              this.detailObject = x;
            } else {
              if (environment.LoggingLevel >= LogLevel.Error) {
                console.log(`AC_HIH_UI [Error]: Entering ngOninit in ControlCenterDetailComponent, failed to readControlCenterEvent : ${x}`);
              }
              this.detailObject = new ControlCenter();
            }
          });

          this._storageService.readAccount(this.routerID);
        }
      }
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.log(`AC_HIH_UI [Error]: Entering ngOnInit in ControlCenterDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
    });
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  public setStep(index: number) {
    this.step = index;
  }

  public nextStep() {
    this.step++;
  }

  public prevStep() {
    this.step--;
  }

  public canSubmit(): boolean {
    return true;
  }
  
  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createControlCenterEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createControlCenterEvent in ControlCenterDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x instanceof ControlCenter) {
          // Show a dialog, then jump to the display view
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Success',
            Content: x.Id.toString(),
            Button: MessageDialogButtonEnum.onlyok
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo
          }).afterClosed().subscribe(x2 => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
            this._router.navigate(['/finance/controlcenter/display/' + x.Id.toString()]);
          });
        } else {
          // Show error message
          const dlginfo: MessageDialogInfo = {
            Header: 'Common.Error',
            Content: x.toString(),
            Button: MessageDialogButtonEnum.onlyok
          };

          this._dialog.open(MessageDialogComponent, {
            disableClose: false,
            width: '500px',
            data: dlginfo
          }).afterClosed().subscribe(x2 => {
            // Do nothing!
            if (environment.LoggingLevel >= LogLevel.Debug) {
              console.log(`AC_HIH_UI [Debug]: Message dialog result ${x2}`);
            }
          });
        }        
      });

      this._storageService.createControlCenter(this.detailObject);
    }
  }
}