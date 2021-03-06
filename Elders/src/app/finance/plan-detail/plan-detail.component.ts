import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatSnackBar, DateAdapter } from '@angular/material';
import * as moment from 'moment';
import { Observable, forkJoin, Subject, BehaviorSubject, merge, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EChartOption } from 'echarts';

import { environment } from '../../../environments/environment';
import { LogLevel, Plan, PlanTypeEnum, UIMode, getUIModeString, UICommonLabelEnum, BuildupAccountForSelection,
  UIAccountForSelection, IAccountCategoryFilter,
} from '../../model';
import { popupDialog, } from '../../message-dialog';
import { HomeDefDetailService, FinanceStorageService, UIStatusService, FinCurrencyService, } from '../../services';
import { ThemeStorage } from '../../theme-picker/theme-storage/theme-storage';

@Component({
  selector: 'hih-finance-plan-detail',
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.scss'],
})
export class PlanDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  public routerID: number;
  public chartTheme: string;
  public currentMode: string;
  public uiMode: UIMode = UIMode.Create;
  public mainFormGroup: FormGroup;
  public arUIAccount: UIAccountForSelection[] = [];
  public uiAccountStatusFilter: string | undefined;
  public uiAccountCtgyFilter: IAccountCategoryFilter | undefined;
  progressChartOption: Observable<EChartOption>;

  get baseCurrency(): string {
    return this._homedefService.ChosedHome.BaseCurrency;
  }
  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }

  constructor(private _homedefService: HomeDefDetailService,
    private _router: Router,
    private _themeStorage: ThemeStorage,
    private _activateRoute: ActivatedRoute,
    private _uiStatusService: UIStatusService,
    private _dateAdapter: DateAdapter<any>,
    private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    public _storageService: FinanceStorageService,
    public _currService: FinCurrencyService) {
    this.mainFormGroup = new FormGroup({
      startdateControl: new FormControl(moment(), Validators.required),
      targetdateControl: new FormControl(moment().add(1, 'M'), Validators.required),
      accountControl: new FormControl('', Validators.required),
      tgtbalanceControl: new FormControl(0, [Validators.required]),
      despControl: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this._destroyed$ = new ReplaySubject(1);

    this.onSetLanguage(this._uiStatusService.CurrentLanguage);

    this._uiStatusService.langChangeEvent.pipe(takeUntil(this._destroyed$)).subscribe((x: any) => {
      this.onSetLanguage(x);
    });

    this._themeStorage.onThemeUpdate.pipe(takeUntil(this._destroyed$)).subscribe((val: any) => {
      if (val.isDark) {
        this.chartTheme = 'dark';
      } else {
        this.chartTheme = 'light';
      }
    });

    forkJoin([
      this._storageService.fetchAllAccountCategories(),
      this._storageService.fetchAllTranTypes(),
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._currService.fetchAllCurrencies(),
    ]).pipe(takeUntil(this._destroyed$)).subscribe((rst: any) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.debug(`AC_HIH_UI [Debug]: Entering DocumentDetailComponent ngOnInit, forkJoin: ${rst.length}`);
      }

      // Accounts
      this.arUIAccount = BuildupAccountForSelection(this._storageService.Accounts, this._storageService.AccountCategories);
      this.uiAccountStatusFilter = undefined;
      this.uiAccountCtgyFilter = undefined;

      this._activateRoute.url.subscribe((x: any) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.debug(`AC_HIH_UI [Debug]: Entering PlanDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
          if (x[0].path === 'create') {
            this.uiMode = UIMode.Create;
            // Do nothing
          } else if (x[0].path === 'edit') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Change;
          } else if (x[0].path === 'display') {
            this.routerID = +x[1].path;

            this.uiMode = UIMode.Display;
          }

          this.currentMode = getUIModeString(this.uiMode);

          if (this.uiMode === UIMode.Display || this.uiMode === UIMode.Change) {
            this._storageService.readPlan(this.routerID)
            .pipe(takeUntil(this._destroyed$))
            .subscribe((nplan: Plan) => {
              this.mainFormGroup.setValue({
                startdateControl: nplan.StartDate,
                targetdateControl: nplan.TargetDate,
                accountControl: nplan.AccountID,
                tgtbalanceControl: nplan.TargetBalance,
                despControl: nplan.Description,
              });

              if (this.uiMode === UIMode.Display) {
                this.mainFormGroup.disable();
              } else if (this.uiMode === UIMode.Change) {
                this.mainFormGroup.enable();
              }
            }, (error: any) => {
              // Show error dialog
              popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
                error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
            });
          }
        }
      });
    }, (error: any) => {
      // Show error dialog
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
    });
  }

  ngOnDestroy(): void {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  public onSubmit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.debug('AC_HIH_UI [Debug]: Entering PlanDetailComponent onSubmit...');
    }

    // Perform the checks
    let nplan: Plan = this._generatePlanObject();
    if (!nplan.onVerify()) {
      // Show a dialog for error details
      popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
        undefined, nplan.VerifiedMsgs);

      return;
    }

    // Generate the plan
    if (this.uiMode === UIMode.Create) {
      // Create
      this._storageService.createPlan(nplan).pipe(takeUntil(this._destroyed$)).subscribe((x: Plan) => {
        // Create successfully
        this._snackbar.open('Succeed', undefined, {
          duration: 2000,
        }).afterDismissed().subscribe(() => {
          this._router.navigate(['/finance/plan/display/' + x.ID.toString()]);
        });
      }, (error: any) => {
        if (environment.LoggingLevel >= LogLevel.Error) {
          console.error(`AC_HIH_UI [Error]: Entering PlanDetailComponent onSubmit to createPlan, failed: ${error}`);
        }

        // Show a dialog for error details
        popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));
        return;
    });
    } else if (this.uiMode === UIMode.Change) {
      // Todo
    }
  }

  public onCancel(): void {
    // Jump back to the list view
    this._router.navigate(['/finance/plan']);
  }

  private _generatePlanObject(): Plan {
    let nplan: Plan = new Plan();
    nplan.HID = this._homedefService.ChosedHome.ID;
    nplan.StartDate = this.mainFormGroup.get('startdateControl').value;
    nplan.TranCurrency = this._homedefService.ChosedHome.BaseCurrency;
    nplan.PlanType = PlanTypeEnum.Account;
    nplan.TargetBalance = this.mainFormGroup.get('tgtbalanceControl').value;
    nplan.TargetDate = this.mainFormGroup.get('dateControl').value;
    nplan.Description = this.mainFormGroup.get('despControl').value;
    nplan.AccountID = this.mainFormGroup.get('accountControl').value;

    return nplan;
  }
  private onSetLanguage(x: string): void {
    if (x === 'zh') {
      moment.locale('zh-cn');
      this._dateAdapter.setLocale('zh-cn');
    } else if (x === 'en') {
      moment.locale(x);
      this._dateAdapter.setLocale('en-us');
    }
  }
}
