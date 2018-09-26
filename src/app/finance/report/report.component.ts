import { Component, OnInit, AfterViewInit, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { MatDialog, MatPaginator, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, BalanceSheetReport, ControlCenterReport, OrderReport, OverviewScopeEnum,
  getOverviewScopeRange, UICommonLabelEnum, Utility, UIDisplayString, AccountCategory } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService, UIStatusService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { Observable, Subject, ReplaySubject, BehaviorSubject, merge, of, forkJoin } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
declare var echarts: any;

/**
 * Data source of BS
 */
export class ReportBSDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<BalanceSheetReport[]> {
    const displayDataChanges: any[] = [
      this._parentComponent.ReportBSEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.ReportBS.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
   }
}

/**
 * Data source of CC
 */
export class ReportCCDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ControlCenterReport[]> {
    const displayDataChanges: any[] = [
      this._parentComponent.ReportCCEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.ReportCC.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
   }
}

/**
 * Data source of Order
 */
export class ReportOrderDataSource extends DataSource<any> {
  constructor(private _parentComponent: ReportComponent,
    private _paginator: MatPaginator) {
    super();
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<OrderReport[]> {
    const displayDataChanges: any[] = [
      this._parentComponent.ReportOrderEvent,
      this._paginator.page,
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      const data: any = this._parentComponent.ReportOrder.slice();

      // Grab the page's slice of data.
      const startIndex: number = this._paginator.pageIndex * this._paginator.pageSize;
      return data.splice(startIndex, this._paginator.pageSize);
    }));
  }

  disconnect(): void {
    // Empty
  }
}

@Component({
  selector: 'hih-finance-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

  // Account
  @ViewChild('chartAccountIncoming') chartAccountIncoming: ElementRef;
  @ViewChild('chartAccountOutgoing') chartAccountOutgoing: ElementRef;

  // MoM
  selectedMOMScope: OverviewScopeEnum;
  momExcludeTransfer: boolean;
  momScopes: UIDisplayString[];

  // B.S.
  @ViewChild('chartAcntCtgyIncoming') chartAcntCtgyIncoming: ElementRef;
  @ViewChild('chartAcntCtgyOutgoing') chartAcntCtgyOutgoing: ElementRef;
  displayedBSColumns: string[] = ['Account', 'Category', 'Debit', 'Credit', 'Balance'];
  dataSourceBS: ReportBSDataSource | undefined;
  ReportBS: BalanceSheetReport[] = [];
  ReportBSEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  @ViewChild('paginatorBS') paginatorBS: MatPaginator;

  // CC
  displayedCCColumns: string[] = ['ControlCenter', 'Debit', 'Credit', 'Balance'];
  dataSourceCC: ReportCCDataSource | undefined;
  ReportCC: ControlCenterReport[] = [];
  ReportCCEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  @ViewChild('paginatorCC') paginatorCC: MatPaginator;

  // Order
  includeInvalid: boolean = false;
  displayedOrderColumns: string[] = ['Order', 'Debit', 'Credit', 'Balance'];
  dataSourceOrder: ReportOrderDataSource | undefined;
  ReportOrder: OrderReport[] = [];
  ReportOrderEvent: EventEmitter<undefined> = new EventEmitter<undefined>(undefined);
  @ViewChild('paginatorOrder') paginatorOrder: MatPaginator;

  viewAccountChart: any[] = [600, 900];
  colorScheme: any = {
    // domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'],
    domain: ['#1B998B', '#2D3047', '#FFFD82', '#FF9B71', '#E84855'],
  };
  datAccountLiability: any[];
  datAccountAsset: any[];
  dataBSCategoryDebit: any[] = [];
  dataBSCategoryCredit: any[] = [];
  dataCCDebit: any[] = [];
  dataCCCredit: any[] = [];
  dataOrderDebit: any[] = [];
  dataOrderCredit: any[] = [];
  dataMOM: any[] = [];
  arAccountCtgy: any[] = [];

  view: number[] = [];

  constructor(private _dialog: MatDialog,
    private _snackbar: MatSnackBar,
    private _tranService: TranslateService,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _homedefService: HomeDefDetailService,
    private _storageService: FinanceStorageService,
    private _uiStatusService: UIStatusService,
    private _currService: FinCurrencyService,
    private media: ObservableMedia) {
    this.selectedMOMScope = OverviewScopeEnum.CurrentYear;
    this.momScopes = [];

    this._uiStatusService.OverviewScopeStrings.forEach((val: UIDisplayString) => {
      if (val.value === OverviewScopeEnum.All || val.value === OverviewScopeEnum.CurrentQuarter
        || val.value === OverviewScopeEnum.CurrentYear || val.value === OverviewScopeEnum.PreviousQuarter
        || val.value === OverviewScopeEnum.PreviousYear) {
        this.momScopes.push(val);
      }
    });
  }

  ngOnInit(): void {
    this.dataSourceBS = new ReportBSDataSource(this, this.paginatorBS);
    this.dataSourceCC = new ReportCCDataSource(this, this.paginatorCC);
    this.dataSourceOrder = new ReportOrderDataSource(this, this.paginatorOrder);

    this.media.asObservable()
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((change: MediaChange) => {
        this.changeGraphSize();
      });

    this.changeGraphSize();
  }

  ngAfterViewInit(): void {
    this._storageService.fetchAllAccountCategories().subscribe((arctgy: AccountCategory[]) => {
      let arstrings: string[] = [];
      for (let lab of arctgy) {
        arstrings.push(lab.Name);
        this.arAccountCtgy.push(lab);
      }

      this._tranService.get(arstrings).subscribe((x: any) => {
        for (let attr in x) {
          for (let lab of this.arAccountCtgy) {
            if (lab.Name === attr) {
              lab.DisplayName = x[attr];
            }
          }
        }

        // Fetch data
        this._fetchData();
      });
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next(true);
    this.ngUnsubscribe$.complete();
  }

  public onMOMScopeChanged(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedMOMScope);

    this._storageService.getReportMonthOnMonth(this.momExcludeTransfer, bgn, end).subscribe((x: any) => {
      if (x instanceof Array && x.length > 0) {
        this.refreshMoMData(x);
      }
    });
  }

  public onMOMExcludeTransferChanged(): void {
    this.momExcludeTransfer = !this.momExcludeTransfer;

    this.onMOMScopeChanged();
  }
  public onBSAccountDebitSelect($event: any): void {
    // Do nothing
  }
  public onBSAccountCreditSelect($event: any): void {
    // Do nothing
  }
  public onBSCategoryDebitSelect($event: any): void {
    // Do nothing
  }
  public onBSCategoryCreditSelect($event: any): void {
    // Do nothing
  }
  public onCCDebitSelect($event: any): void {
    // Do nothing
  }
  public onCCCreditSelect($event: any): void {
    // Do nothing
  }
  public onOrderDebitSelect($event: any): void {
    // Do nothing
  }
  public onOrderCreditSelect($event: any): void {
    // Do nothing
  }
  public onTrendSelect($event: any): void {
    // Do nothing
  }

  // Refresh the Order Report
  public onReportOrderRefresh(): void {
    // Do nothing
  }

  private refreshMoMData(data: any): void {
    this.dataMOM = [];

    for (let inmom of data) {
      const strmonth: any = inmom.year.toString() + Utility.prefixInteger(inmom.month, 2);
      let outidx: number = this.dataMOM.findIndex((val: any) => {
        return val.name === strmonth;
      });

      if (outidx === -1) {
        let outmom: any = {};
        outmom.name = strmonth;
        outmom.series = [];
        if (inmom.expense) {
          outmom.series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Outgoing),
            value: inmom.tranAmount,
          });
        } else {
          outmom.series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Incoming),
            value: inmom.tranAmount,
          });
        }

        this.dataMOM.push(outmom);
      } else {
        if (inmom.expense) {
          this.dataMOM[outidx].series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Outgoing),
            value: inmom.tranAmount,
          });
        } else {
          this.dataMOM[outidx].series.push({
            name: this._uiStatusService.getUILabel(UICommonLabelEnum.Incoming),
            value: inmom.tranAmount,
          });
        }
      }
    }
  }
  private refreshOrderReportData(data: any): void {
    this.ReportOrder = [];
    for (let bs of data) {
      let rbs: OrderReport  = new OrderReport();
      rbs.onSetData(bs);

      if (rbs.DebitBalance) {
        this.dataCCDebit.push({
          name: rbs.OrderName,
          value: rbs.DebitBalance,
        });
      }

      if (rbs.CreditBalance) {
        this.dataCCCredit.push({
          name: rbs.OrderName,
          value: rbs.CreditBalance,
        });
      }

      this.ReportOrder.push(rbs);
    }
  }
  private refreshControlCenterReportData(data: any): void {
    this.dataCCDebit = [];
    this.dataCCCredit = [];
    this.ReportCC = [];

    for (let bs of data) {
      let rbs: ControlCenterReport  = new ControlCenterReport();
      rbs.onSetData(bs);

      if (rbs.DebitBalance) {
        this.dataCCDebit.push({
          name: rbs.ControlCenterName,
          value: rbs.DebitBalance,
        });
      }

      if (rbs.CreditBalance) {
        this.dataCCCredit.push({
          name: rbs.ControlCenterName,
          value: rbs.CreditBalance,
        });
      }

      this.ReportCC.push(rbs);
    }
  }
  private refreshBalanceSheetReportData(data: any): void {
    this.ReportBS = [];
    this.dataBSCategoryDebit = [];
    this.dataBSCategoryCredit = [];
    this.datAccountAsset = [];
    this.datAccountLiability = [];

    for (let bs of data) {
      let rbs: BalanceSheetReport  = new BalanceSheetReport();
      rbs.onSetData(bs);

      if (rbs.DebitBalance) {
        let ctgyExist: boolean = false;
        for (let cd of this.dataBSCategoryDebit) {
          if (cd.ctgyid === rbs.AccountCategoryId) {
            ctgyExist = true;

            cd.value += rbs.DebitBalance;
            break;
          }
        }

        if (!ctgyExist) {
          let ctgyname: string = '';
          for (let lab of this.arAccountCtgy) {
            if (lab.ID === rbs.AccountCategoryId) {
              ctgyname = lab.DisplayName;
              break;
            }
          }
          if (ctgyname.length <= 0) {
            ctgyname = rbs.AccountCategoryName;
          }

          this.dataBSCategoryDebit.push({
            ctgyid: rbs.AccountCategoryId,
            name: ctgyname,
            value: rbs.DebitBalance,
          });
        }
      }

      if (rbs.CreditBalance) {
        let ctgyExist: boolean = false;
        for (let cd of this.dataBSCategoryCredit) {
          if (cd.ctgyid === rbs.AccountCategoryId) {
            ctgyExist = true;

            cd.value += rbs.CreditBalance;
            break;
          }
        }

        if (!ctgyExist) {
          let ctgyname: string = '';
          for (let lab of this.arAccountCtgy) {
            if (lab.ID === rbs.AccountCategoryId) {
              ctgyname = lab.DisplayName;
              break;
            }
          }
          if (ctgyname.length <= 0) {
            ctgyname = rbs.AccountCategoryName;
          }

          this.dataBSCategoryCredit.push({
            ctgyid: rbs.AccountCategoryId,
            name: ctgyname,
            value: rbs.CreditBalance,
          });
        }
      }

      if (rbs.Balance) {
        for (let ctgy of this.arAccountCtgy) {
          if (ctgy.ID === rbs.AccountCategoryId) {
            if (ctgy.AssetFlag) {
              this.datAccountAsset.push({
                name: rbs.AccountName,
                value: rbs.Balance,
              });
            } else {
              this.datAccountLiability.push({
                name: rbs.AccountName,
                value: rbs.Balance * (-1),
              });
            }

            break;
          }
        }
      }

      this.ReportBS.push(rbs);
    }
  }

  private changeGraphSize(): void {
    let graphSize: number = 0;

    if (this.media.isActive('xs')) {
      graphSize = 150;
    } else if (this.media.isActive('sm')) {
      graphSize = 300;
    } else if (this.media.isActive('md')) {
      graphSize = 450;
    } else {
      graphSize = 500;
    }

    this.view = [graphSize, graphSize / 1.33];
  }

  private _fetchData(): void {
    let { BeginDate: bgn, EndDate: end } = getOverviewScopeRange(this.selectedMOMScope);

    forkJoin([
      this._storageService.fetchAllAccounts(),
      this._storageService.fetchAllControlCenters(),
      this._storageService.fetchAllOrders(),
      this._storageService.getReportBS(),
      this._storageService.getReportCC(),
      this._storageService.getReportOrder(),
      this._storageService.getReportMonthOnMonth(this.momExcludeTransfer, bgn, end),
    ]).subscribe((x: any) => {
      let idxbs: number = 3;
      let idxcc: number = 4;
      let idxorder: number = 5;
      let idxmom: number = 6;

      // Balance sheet
      if (x[idxbs] instanceof Array && x[idxbs].length > 0) {
        this.refreshBalanceSheetReportData(x[idxbs]);
      }

      // Control center
      if (x[idxcc] instanceof Array && x[idxcc].length > 0) {
        this.refreshControlCenterReportData(x[idxcc]);
      }

      // Order report
      if (x[idxorder] instanceof Array && x[idxorder].length > 0) {
        this.refreshOrderReportData(x[idxorder]);
      }

      // Month on month
      if (x[idxmom] instanceof Array && x[idxmom].length > 0) {
        this.refreshMoMData(x[idxmom]);
      }

      this._buildAccountInChart();
      this._buildAccountOutChart();
      this._buildAccountCategoryInChart();
      this._buildAccountCategoryOutChart();

      // Trigger the events
      this.ReportBSEvent.emit();
      this.ReportCCEvent.emit();
      this.ReportOrderEvent.emit();
    });
  }
  private _buildAccountInChart(): void {
    let chartAcntIn: any = echarts.init(this.chartAccountIncoming.nativeElement);

    // Account incoming
    let optionAcntIn: any = {
      backgroundColor: '#2c343c',
      title: {
        text: 'Assets',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ccc',
        },
      },
      tooltip : {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      visualMap: {
        show: false,
        min: 80,
        max: 600,
        inRange: {
          colorLightness: [0, 1],
        },
      },
      series : [{
        name: 'Accounts',
        type: 'pie',
        radius : '55%',
        center: ['50%', '50%'],
        data: this.datAccountAsset,
        roseType: 'radius',
        label: {
          normal: {
            textStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
        labelLine: {
          normal: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
            smooth: 0.2,
            length: 10,
            length2: 20,
          },
        },
        itemStyle: {
          normal: {
            color: '#c23531',
            shadowBlur: 200,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },

        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function(idx: any): number {
          return Math.random() * 200;
        },
      }],
    };
    chartAcntIn.setOption(optionAcntIn);
  }
  private _buildAccountOutChart(): void {
    let chartAcntOut: any = echarts.init(this.chartAccountOutgoing.nativeElement);

    // Account outgoing
    let optionAcntOut: any = {
      backgroundColor: '#dc343c',
      title: {
        text: 'Liabilities',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ccc',
        },
      },
      tooltip : {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
      },
      visualMap: {
        show: false,
        min: 80,
        max: 600,
        inRange: {
          colorLightness: [0, 1],
        },
      },
      series : [{
        name: 'Accounts',
        type: 'pie',
        radius : '55%',
        center: ['50%', '50%'],
        data: this.datAccountLiability,
        roseType: 'radius',
        label: {
          normal: {
            textStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
        },
        labelLine: {
          normal: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
            smooth: 0.2,
            length: 10,
            length2: 20,
          },
        },
        itemStyle: {
          normal: {
            color: '#c23531',
            shadowBlur: 200,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },

        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function(idx: any): number {
          return Math.random() * 200;
        },
      }],
    };
    chartAcntOut.setOption(optionAcntOut);
  }
  private _buildAccountCategoryInChart(): void {
    let chartAcntCtgyIn: any = echarts.init(this.chartAcntCtgyIncoming.nativeElement);
    let colors: any = ['#FFAE57', '#FF7853', '#EA5151', '#CC3F57', '#9A2555'];
    let bgColor: any = '#2E2733';

    // Refer to http://echarts.baidu.com/examples/editor.html?c=sunburst-book
    let data = '{"name":"虚构","itemStyle":{"normal":{"color":"#FF7853"}},"children":[{"name":"小说","children":[{"name":"5☆","children":[{"name":"疼","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}},{"name":"慈悲","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}},{"name":"楼下的房客","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}}],"label":{"color":"#FFAE57","downplay":{"opacity":0.5}}},{"name":"4☆","children":[{"name":"虚无的十字架","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"无声告白","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"童年的终结","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}},{"name":"3☆","children":[{"name":"疯癫老人日记","value":1,"itemStyle":{"opacity":1,"color":"#EA5151"},"label":{"color":"#EA5151"}}],"label":{"color":"#EA5151","downplay":{"opacity":0.5}}}],"itemStyle":{}},{"name":"其他","children":[{"name":"5☆","children":[{"name":"纳博科夫短篇小说全集","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}}],"label":{"color":"#FFAE57","downplay":{"opacity":0.5}}},{"name":"4☆","children":[{"name":"安魂曲","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"人生拼图版","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}},{"name":"3☆","children":[{"name":"比起爱你，我更需要你","value":1,"itemStyle":{"opacity":1,"color":"#EA5151"},"label":{"color":"#EA5151"}}],"label":{"color":"#EA5151","downplay":{"opacity":0.5}}}],"itemStyle":{}}]},{"name":"非虚构","itemStyle":{"color":"#EA5151"},"children":[{"name":"设计","children":[{"name":"5☆","children":[{"name":"无界面交互","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}}],"label":{"color":"#FFAE57","downplay":{"opacity":0.5}}},{"name":"4☆","children":[{"name":"数字绘图的光照与渲染技术","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"日本建筑解剖书","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}},{"name":"3☆","children":[{"name":"奇幻世界艺术\n&RPG地图绘制讲座","value":1,"itemStyle":{"opacity":1,"color":"#EA5151"},"label":{"color":"#EA5151"}}],"label":{"color":"#EA5151","downplay":{"opacity":0.5}}}],"itemStyle":{"color":"#EA5151"}},{"name":"社科","children":[{"name":"5☆","children":[{"name":"痛点","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}}],"label":{"color":"#FFAE57","downplay":{"opacity":0.5}}},{"name":"4☆","children":[{"name":"卓有成效的管理者","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"进化","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"后物欲时代的来临","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}},{"name":"3☆","children":[{"name":"疯癫与文明","value":1,"itemStyle":{"opacity":1,"color":"#EA5151"},"label":{"color":"#EA5151"}}],"label":{"color":"#EA5151","downplay":{"opacity":0.5}}}],"itemStyle":{"color":"#EA5151"}},{"name":"心理","children":[{"name":"5☆","children":[{"name":"我们时代的神经症人格","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}}],"label":{"color":"#FFAE57","downplay":{"opacity":0.5}}},{"name":"4☆","children":[{"name":"皮格马利翁效应","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"受伤的人","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}},{"name":"3☆","label":{"color":"#EA5151","downplay":{"opacity":0.5}}},{"name":"2☆","children":[{"name":"迷恋","value":1,"itemStyle":{"opacity":1,"color":"#CC3F57"},"label":{"color":"#CC3F57"}}],"label":{"color":"#CC3F57","downplay":{"opacity":0.5}}}],"itemStyle":{"color":"#EA5151"}},{"name":"居家","children":[{"name":"4☆","children":[{"name":"把房子住成家","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"只过必要生活","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"北欧简约风格","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}}],"itemStyle":{"color":"#EA5151"}},{"name":"绘本","children":[{"name":"5☆","children":[{"name":"设计诗","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}}],"label":{"color":"#FFAE57","downplay":{"opacity":0.5}}},{"name":"4☆","children":[{"name":"假如生活糊弄了你","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}},{"name":"博物学家的神秘动物图鉴","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}},{"name":"3☆","children":[{"name":"方向","value":1,"itemStyle":{"opacity":1,"color":"#EA5151"},"label":{"color":"#EA5151"}}],"label":{"color":"#EA5151","downplay":{"opacity":0.5}}}],"itemStyle":{"color":"#EA5151"}},{"name":"哲学","children":[{"name":"4☆","children":[{"name":"人生的智慧","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}}],"itemStyle":{"color":"#EA5151"}},{"name":"技术","children":[{"name":"5☆","children":[{"name":"代码整洁之道","value":1,"itemStyle":{"opacity":1,"color":"#FFAE57"},"label":{"color":"#FFAE57"}}],"label":{"color":"#FFAE57","downplay":{"opacity":0.5}}},{"name":"4☆","children":[{"name":"Three.js 开发指南","value":1,"itemStyle":{"opacity":1,"color":"#FF7853"},"label":{"color":"#FF7853"}}],"label":{"color":"#FF7853","downplay":{"opacity":0.5}}}],"itemStyle":{"color":"#EA5151"}}]}]';
    let datObj = JSON.parse(data);
    
    // Account category incoming
    let optionAcntCtgyIn: any = {
      backgroundColor: bgColor,
      color: colors,
      series: [{
        type: 'sunburst',
        center: ['50%', '48%'],
        data: this.dataBSCategoryDebit,
        // sort: function (a, b) {
        //     if (a.depth === 1) {
        //         return b.getValue() - a.getValue();
        //     }
        //     else {
        //         return a.dataIndex - b.dataIndex;
        //     }
        // },
        label: {
          rotate: 'radial',
          color: bgColor,
        },
        itemStyle: {
          borderColor: bgColor,
          borderWidth: 2,
        },
        levels: [{}, {
          r0: 0,
          r: 40,
          label: {
            rotate: 0,
          },
        }, {
          r0: 40,
          r: 105,
        }, {
          r0: 115,
          r: 140,
          itemStyle: {
            shadowBlur: 2,
            shadowColor: colors[2],
            color: 'transparent',
          },
          label: {
            rotate: 'tangential',
            fontSize: 10,
            color: colors[0],
          },
        }, {
          r0: 140,
          r: 145,
          itemStyle: {
            shadowBlur: 80,
            shadowColor: colors[0],
          },
          label: {
            position: 'outside',
            textShadowBlur: 5,
            textShadowColor: '#333',
          },
          downplay: {
            label: {
              opacity: 0.5,
            },
          },
        }],
      }],
    };

    chartAcntCtgyIn.setOption(optionAcntCtgyIn);
  }
  private _buildAccountCategoryOutChart(): void {
    let chartAcntCtgyOut: any = echarts.init(this.chartAcntCtgyOutgoing.nativeElement);
    let colors: any = ['#FFAE57', '#FF7853', '#EA5151', '#CC3F57', '#9A2555'];
    let bgColor: any = '#2E2733';

    // Account category outgoing
  }
}
