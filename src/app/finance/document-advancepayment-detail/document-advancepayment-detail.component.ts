import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { DataSource } from '@angular/cdk/collections';
import { Router, ActivatedRoute } from '@angular/router';
import { MdDialog, MdSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { LogLevel, Document, DocumentItem, UIMode, getUIModeString } from '../../model';
import { HomeDefDetailService, FinanceStorageService, FinCurrencyService } from '../../services';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../../message-dialog';


@Component({
  selector: 'app-document-advancepayment-detail',
  templateUrl: './document-advancepayment-detail.component.html',
  styleUrls: ['./document-advancepayment-detail.component.scss']
})
export class DocumentAdvancepaymentDetailComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
