import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtLoanComponent } from './account-ext-loan.component';

describe('AccountExtLoanComponent', () => {
  let component: AccountExtLoanComponent;
  let fixture: ComponentFixture<AccountExtLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});