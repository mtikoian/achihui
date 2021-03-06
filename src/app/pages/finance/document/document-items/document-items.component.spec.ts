import { async, ComponentFixture, TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { HttpClientTestingModule, } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgZorroAntdModule, NzSelectComponent, NzInputNumberComponent, NzInputDirective, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createKeyboardEvent, dispatchFakeEvent, dispatchKeyboardEvent, MockNgZone, typeInElement } from 'ng-zorro-antd/core';

import { DocumentItemsComponent } from './document-items.component';
import { getTranslocoModule, FakeDataHelper, } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo, DocumentItem, Document, UIAccountForSelection, BuildupAccountForSelection, UIOrderForSelection,
  BuildupOrderForSelection,
  UIMode,
  financeDocTypeNormal, } from '../../../../model';

describe('DocumentItemsComponent', () => {
  let component: DocumentItemsComponent;
  let fixture: ComponentFixture<DocumentItemsComponent>;
  let fakeData: FakeDataHelper;
  let arUIAccounts: UIAccountForSelection[];
  let arUIOrders: UIOrderForSelection[];

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinControlCenter();
    fakeData.buildFinAccounts();
    fakeData.buildFinOrders();

    arUIAccounts = BuildupAccountForSelection(fakeData.finAccounts, fakeData.finAccountCategories);
    arUIOrders = BuildupOrderForSelection(fakeData.finOrders);
  });

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => '';
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentItemsComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemsComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Enable mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      component.arControlCenters = fakeData.finControlCenters;
      component.arCurrencies = fakeData.currencies;
      component.arTranType = fakeData.finTranTypes;
      component.arUIAccounts = arUIAccounts;
      component.arUIOrders = arUIOrders;
      component.currentUIMode = UIMode.Create;
      component.docType = financeDocTypeNormal;
      component.tranCurr = fakeData.chosedHome.BaseCurrency;
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall be invalid if no items', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.noitems).toBeTruthy();
    }));
    it('shall be invalid if items without account', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.listItems = [ditem];
      component.onChange();

      const err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithoutaccount).toBeTruthy('Expect itemwithoutaccount is true');
    }));
    it('shall be invalid if items without tran type', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      // ditem.TranType = 2;
      ditem.Desp = 'test';
      component.listItems = [ditem];
      component.onChange();

      const err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithouttrantype).toBeTruthy('Expect itemwithouttrantype is true');
    }));
    it('shall be invalid if items without amount', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      // ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.listItems = [ditem];
      component.onChange();

      const err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithoutamount).toBeTruthy('Expect itemwithoutamount is true');
    }));
    it('shall be invalid if items without cost object', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      // ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.listItems = [ditem];
      component.onChange();

      const err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithwrongcostobject).toBeTruthy('Expect itemwithwrongcostobject is true');
    }));
    it('shall be invalid if items have cost center and order both', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.OrderId = fakeData.finOrders[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.listItems = [ditem];
      component.onChange();

      const err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithwrongcostobject).toBeTruthy('Expect itemwithwrongcostobject is true');
    }));
    it('shall be invalid if items without desp', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      // ditem.Desp = 'test';
      component.listItems = [ditem];
      component.onChange();

      const err: any = component.validate(undefined);
      expect(err).toBeTruthy();
      expect(err.itemwithoutdesp).toBeTruthy('Expect itemwithoutdesp is true');
    }));
    it('shall remove item on deletion', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      // component.listItems = [ditem];

      component.onDeleteDocItem(component.listItems[0]);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.listItems.length).toEqual(0);
    }));
    it('shall be valid in valid case', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateDocItem();
      const ditem: DocumentItem = component.listItems[0];
      ditem.AccountId = fakeData.finAccounts[0].Id;
      ditem.TranAmount = 200;
      ditem.ControlCenterId = fakeData.finControlCenters[0].Id;
      ditem.TranType = 2;
      ditem.Desp = 'test';
      component.listItems = [ditem];
      component.onChange();

      const err: any = component.validate(undefined);
      expect(err).toBeNull();
    }));
    it('createItem method', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      component.onCreateDocItem();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      let tablebody = fixture.debugElement.queryAll(By.css('.ant-table-tbody'));
      expect(tablebody.length).toEqual(1);
      let tablerows = tablebody[0].queryAll(By.css('.ant-table-row'));
      expect(tablerows.length).toEqual(1);
      for (let i = 0; i < tablerows[0].childNodes.length; i++) {
        if (i === 1) {
          // Account ID
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let select = dbgelem.query(By.directive(NzSelectComponent));
          expect(select).toBeTruthy();
          let selectComponent = select.injector.get(NzSelectComponent);
          expect(selectComponent).toBeTruthy();
          select.nativeElement.click();
          fixture.detectChanges();
          overlayContainerElement.querySelector('li')!.click();
          fixture.detectChanges();

          flush();
          fixture.detectChanges();
        } else if (i === 2) {
          // Tran type
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let select = dbgelem.query(By.directive(NzSelectComponent));
          expect(select).toBeTruthy();
          let selectComponent = select.injector.get(NzSelectComponent);
          expect(selectComponent).toBeTruthy();
          select.nativeElement.click();
          fixture.detectChanges();
          overlayContainerElement.querySelector('li')!.click();
          fixture.detectChanges();

          flush();
          fixture.detectChanges();
        } else if (i === 3) {
          // Amount
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let inpNumber = dbgelem.query(By.directive(NzInputNumberComponent));
          expect(inpNumber).toBeTruthy();
          let inpNumberComponent = inpNumber.injector.get(NzInputNumberComponent) as NzInputNumberComponent;
          expect(inpNumberComponent).toBeTruthy();
          inpNumberComponent.setValue(20, true);
          fixture.detectChanges();

          expect(component.listItems[0].TranAmount).toEqual(20);
          flush();
          fixture.detectChanges();
        } else if (i === 4) {
          // Currencies
        } else if (i === 5) {
          // Desp
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let inpElem = dbgelem.query(By.directive(NzInputDirective));
          expect(inpElem).toBeTruthy();

          typeInElement('Test', inpElem.nativeElement);
          fixture.detectChanges();
          expect(component.listItems[0].Desp).toEqual('Test');

          flush();
          fixture.detectChanges();
        } else if (i === 6) {
          // Control center
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let select = dbgelem.query(By.directive(NzSelectComponent));
          expect(select).toBeTruthy();
          let selectComponent = select.injector.get(NzSelectComponent);
          expect(selectComponent).toBeTruthy();
          select.nativeElement.click();
          fixture.detectChanges();
          overlayContainerElement.querySelector('li')!.click();
          fixture.detectChanges();

          flush();
          fixture.detectChanges();
        } else if (i === 7) {
          // Order
          // Just skip it
        }
      }

      // Now check the document items
      flush();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.listItems.length).toEqual(1);
      expect(component.listItems[0].Desp).toEqual('Test');
      expect(component.listItems[0].TranAmount).toEqual(20);
    }));
    it('onChange method', fakeAsync(() => {
      const changefn = () => {};
      component.registerOnChange(changefn);
      spyOn(component, 'onChange').and.callThrough();

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.onChange).toHaveBeenCalledTimes(0);
      component.onCreateDocItem();
      expect(component.onChange).toHaveBeenCalledTimes(1);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      let tablebody = fixture.debugElement.queryAll(By.css('.ant-table-tbody'));
      expect(tablebody.length).toEqual(1);
      let tablerows = tablebody[0].queryAll(By.css('.ant-table-row'));
      expect(tablerows.length).toEqual(1);
      for (let i = 0; i < tablerows[0].childNodes.length; i++) {
        if (i === 1) {
          // Account ID
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let select = dbgelem.query(By.directive(NzSelectComponent));
          expect(select).toBeTruthy();
          let selectComponent = select.injector.get(NzSelectComponent);
          expect(selectComponent).toBeTruthy();
          select.nativeElement.click();
          fixture.detectChanges();
          overlayContainerElement.querySelector('li')!.click();
          fixture.detectChanges();

          flush();
          fixture.detectChanges();
          expect(component.onChange).toHaveBeenCalledTimes(2);
        } else if (i === 2) {
          // Tran type
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let select = dbgelem.query(By.directive(NzSelectComponent));
          expect(select).toBeTruthy();
          let selectComponent = select.injector.get(NzSelectComponent);
          expect(selectComponent).toBeTruthy();
          select.nativeElement.click();
          fixture.detectChanges();
          overlayContainerElement.querySelector('li')!.click();
          fixture.detectChanges();

          flush();
          fixture.detectChanges();
          expect(component.onChange).toHaveBeenCalledTimes(3);
        } else if (i === 3) {
          // Amount
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let inpNumber = dbgelem.query(By.directive(NzInputNumberComponent));
          expect(inpNumber).toBeTruthy();
          let inpNumberComponent = inpNumber.injector.get(NzInputNumberComponent) as NzInputNumberComponent;
          expect(inpNumberComponent).toBeTruthy();
          inpNumberComponent.setValue(20, true);
          fixture.detectChanges();

          expect(component.listItems[0].TranAmount).toEqual(20);
          flush();
          fixture.detectChanges();
          expect(component.onChange).toHaveBeenCalledTimes(4);
        } else if (i === 4) {
          // Currencies
        } else if (i === 5) {
          // Desp
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let inpElem = dbgelem.query(By.directive(NzInputDirective));
          expect(inpElem).toBeTruthy();

          typeInElement('Test', inpElem.nativeElement);
          fixture.detectChanges();
          expect(component.listItems[0].Desp).toEqual('Test');

          flush();
          fixture.detectChanges();
          expect(component.onChange).toHaveBeenCalledTimes(5);
        } else if (i === 6) {
          // Control center
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let select = dbgelem.query(By.directive(NzSelectComponent));
          expect(select).toBeTruthy();
          let selectComponent = select.injector.get(NzSelectComponent);
          expect(selectComponent).toBeTruthy();
          select.nativeElement.click();
          fixture.detectChanges();
          overlayContainerElement.querySelector('li')!.click();
          fixture.detectChanges();

          flush();
          fixture.detectChanges();
          expect(component.onChange).toHaveBeenCalledTimes(6);
        } else if (i === 7) {
          // Order
          let dbgelem = tablerows[0].childNodes[i] as DebugElement;
          let select = dbgelem.query(By.directive(NzSelectComponent));
          expect(select).toBeTruthy();
          let selectComponent = select.injector.get(NzSelectComponent);
          expect(selectComponent).toBeTruthy();
          select.nativeElement.click();
          fixture.detectChanges();
          overlayContainerElement.querySelector('li')!.click();
          fixture.detectChanges();

          flush();
          fixture.detectChanges();
          expect(component.onChange).toHaveBeenCalledTimes(7);
        }
      }

      flush();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
    }));
  });
});
