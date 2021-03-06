import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { DocumentHeaderComponent } from '../document-header';
import { DocumentTransferCreateComponent } from './document-transfer-create.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, momentDateFormat } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';

describe('DocumentTransferCreateComponent', () => {
  let component: DocumentTransferCreateComponent;
  let fixture: ComponentFixture<DocumentTransferCreateComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;
  let fetchAllDocTypesSpy: any;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllTranTypesSpy: any;
  let fetchAllAccountsSpy: any;
  let fetchAllControlCentersSpy: any;
  let fetchAllOrdersSpy: any;
  let createDocumentSpy: any;
  const modalClassName = '.ant-modal-body';
  const nextButtonId = '#button_next_step';

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinAccounts();
    fakeData.buildFinOrders();
  });

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => '';
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefOdataService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    const odataService: any = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllCurrencies',
      'fetchAllDocTypes',
      'fetchAllAccountCategories',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'createDocument',
    ]);
    fetchAllCurrenciesSpy = odataService.fetchAllCurrencies.and.returnValue(of([]));
    fetchAllDocTypesSpy = odataService.fetchAllDocTypes.and.returnValue(of([]));
    fetchAllAccountCategoriesSpy = odataService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllTranTypesSpy = odataService.fetchAllTranTypes.and.returnValue(of([]));
    fetchAllAccountsSpy = odataService.fetchAllAccounts.and.returnValue(of([]));
    fetchAllControlCentersSpy = odataService.fetchAllControlCenters.and.returnValue(of([]));
    fetchAllOrdersSpy = odataService.fetchAllOrders.and.returnValue(of([]));
    createDocumentSpy = odataService.createDocument.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentHeaderComponent,
        DocumentTransferCreateComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        // { provide: Router, useValue: routerSpy },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
      ]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTransferCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('1. should create without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      // Order
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when currency service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Currency service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Currency service failed',
      //   'Expected snack bar to show the error message: Currency service failed');
      flush();
    }));

    it('2. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError<string>('Account category service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Account category service failed',
      //   'Expected snack bar to show the error message: Account category service failed');
      flush();
    }));

    it('3. should display error when doc type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllDocTypesSpy.and.returnValue(asyncError<string>('Doc type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Doc type service failed',
      //   'Expected snack bar to show the error message: Doc type service failed');
      flush();
    }));

    it('4. should display error when tran type service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllTranTypesSpy.and.returnValue(asyncError<string>('Tran type service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Tran type service failed',
      //   'Expected snack bar to show the error message: Tran type service failed');
      flush();
    }));

    it('5. should display error when accont service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError<string>('Account service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Account service failed',
      //   'Expected snack bar to show the error message: Account service failed');
      flush();
    }));

    it('6. should display error when control center service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllControlCentersSpy.and.returnValue(asyncError<string>('Control center service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Control center service failed',
      //   'Expected snack bar to show the error message: Control center service failed');
      flush();
    }));

    it('7. should display error when order service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllOrdersSpy.and.returnValue(asyncError<string>('Order service failed'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const messageElement: any = overlayContainerElement.querySelector(modalClassName)!;
      expect(messageElement).toBeTruthy();
      // expect(messageElement.textContent).toContain('Order service failed',
      //   'Expected snack bar to show the error message: Order service failed');
      flush();
    }));
  });

  describe('3. should prevent errors by the checking logic', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllDocTypesSpy.and.returnValue(asyncData(fakeData.finDocTypes));
      fetchAllTranTypesSpy.and.returnValue(asyncData(fakeData.finTranTypes));

      // Accounts
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
      // CC
      fetchAllControlCentersSpy.and.returnValue(asyncData(fakeData.finControlCenters));
      // Order
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('step 0: should set the default values: base currency, date, and so on', fakeAsync(() => {
      expect(component.headerFormGroup.valid).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0); // First step
      flush();
      fixture.detectChanges();

      const docobj: Document = component.headerFormGroup.get('headerControl').value as Document;
      expect(docobj.TranCurr).toEqual(fakeData.chosedHome.BaseCurrency);
    }));

    it('step 0: should have accounts and orders loaded', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccounts.length).toEqual(0);
      expect(component.arUIOrders.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arUIAccounts.length).toBeGreaterThan(0);
      expect(component.arUIOrders.length).toBeGreaterThan(0);
    }));

    it('step 0: amount is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      expect(component.arUIAccounts.length).toEqual(0);
      expect(component.arUIOrders.length).toEqual(0);

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      const curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.valid).toBeFalsy('Expect header form is invalid because amount is missing');
      fixture.detectChanges();

      // Click the next button
      expect(component.nextButtonEnabled).toBeFalse();

      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      expect(component.currentStep).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(0);
    }));

    it('step 0: shall go to step 1 for base currency case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      expect(component.currentStep).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(1);
    }));

    it('step 0: shall go to step 1 for foreign currency case', fakeAsync(() => {
      expect(component.headerFormGroup.valid).toBeFalsy();
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.currentStep).toEqual(0); // At first page

      let curdoc: Document = new Document();
      curdoc.TranCurr = 'USD';
      curdoc.ExgRate = 653.33;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      expect(component.currentStep).toBe(0);

      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(1);
    }));

    it('step 1: account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      expect(component.headerFormGroup.valid).toBeTruthy('Expect header from is valid');
      expect(component.nextButtonEnabled).toBeTruthy('Expect next button is enabled');
      expect(component.currentStep).toBe(0);
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 1
      expect(component.currentStep).toBe(1);

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button, still at second step
      nextButtonNativeEl.click();
      fixture.detectChanges();

      expect(component.currentStep).toBe(1);
    }));

    // Step 1: Asset account should not allowed
    // Step 1: ADP account should not allowed

    it('step 1: neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      fixture.detectChanges();

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(1);
    }));

    it('step 1: control center and order both', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();

      // However, it is invalid
      expect(component.fromFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(1);
    }));

    it('step 2: account is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));

    it('step 2: to account shall not identical as from account', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header form');
      component.headerFormGroup.updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      expect(component.headerFormGroup.valid).toBeTruthy('Expect a valid header step');
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1, 'Expect the stepper is now in From Step');
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      component.toFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.toFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.toFormGroup.updateValueAndValidity();
      expect(component.toFormGroup.valid).toBeFalsy('Expect the from account and to account are not the same');

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));

    // Step 2: Asset account should not allowed
    // Step 2: ADP account should not allowed

    it('step 2: neither control center nor order', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.get('amountControl').setValue(100);
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));

    it('step 2: control center and order both', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      let curdoc: Document = new Document();
      curdoc.TranCurr = fakeData.chosedHome.BaseCurrency;
      curdoc.Desp = 'test';
      // curdoc.TranDate = moment();
      component.headerFormGroup.get('headerControl').setValue(curdoc);
      component.headerFormGroup.get('headerControl').updateValueAndValidity();
      component.headerFormGroup.get('amountControl').setValue(100);
      expect(component.headerFormGroup.get('headerControl').valid).toBeTruthy('Expect a valid header');
      component.headerFormGroup.updateValueAndValidity();
      fixture.detectChanges();

      // Click the next button
      let nextButtonNativeEl: any = fixture.debugElement.queryAll(By.css(nextButtonId))[0].nativeElement;
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now sit in step 2
      expect(component.currentStep).toBe(1);

      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      fixture.detectChanges();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();

      // Now in step 3
      expect(component.currentStep).toBe(2);
      component.fromFormGroup.get('accountControl').setValue(fakeData.finAccounts[0].Id);
      component.fromFormGroup.get('ccControl').setValue(fakeData.finControlCenters[0].Id);
      component.fromFormGroup.get('orderControl').setValue(fakeData.finOrders[0].Id);
      fixture.detectChanges();
      expect(component.toFormGroup.valid).toBeFalsy();

      // Click the next button
      nextButtonNativeEl.click();
      fixture.detectChanges();
      expect(component.currentStep).toBe(2);
    }));
  });
});
