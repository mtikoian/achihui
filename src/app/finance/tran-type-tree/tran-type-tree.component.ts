import { Component, OnInit } from '@angular/core';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogLevel, TranType, TranTypeLevelEnum, UIDisplayStringUtil } from '../../model';
import { FinanceStorageService, UIStatusService } from '../../services';

/**
 * Tran type data with nested structure.
 * Each node has a display name anda list of children.
 */
export class TranTypeTreeNode {
  children: TranTypeTreeNode[];
  displayname: string;
  id: number;
}

/** Flat node with expandable and level information */
export class TranTypeTreeFlatNode {
  displayname: string;
  id: number;
  childamount: number;

  level: number;
  expandable: boolean;
}

@Component({
  selector: 'hih-finance-tran-type-tree',
  templateUrl: './tran-type-tree.component.html',
  styleUrls: ['./tran-type-tree.component.scss'],
})
export class TranTypeTreeComponent implements OnInit {
  isLoadingResults: boolean;
  treeControl: FlatTreeControl<TranTypeTreeFlatNode>;
  treeFlattener: MatTreeFlattener<TranTypeTreeNode, TranTypeTreeFlatNode>;
  dataSource: MatTreeFlatDataSource<TranTypeTreeNode, TranTypeTreeFlatNode>;

  constructor(public _storageService: FinanceStorageService,
    public _uiStatusService: UIStatusService) {

    this.isLoadingResults = false;

    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<TranTypeTreeFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  }

  ngOnInit(): void {
    this.isLoadingResults = true;
    this._storageService.fetchAllTranTypes().subscribe((x: any) => {
      let nodes: TranTypeTreeNode[] = this._buildTypeTree(x, 1);
      this.dataSource.data = nodes;
    }, (error: any) => {
      // Do nothing
    }, () => {
      this.isLoadingResults = false;
    });
  }

  transformer = (node: TranTypeTreeNode, level: number) => {
    let flatNode: TranTypeTreeFlatNode = new TranTypeTreeFlatNode();
    flatNode.displayname = node.displayname;
    flatNode.id = node.id;
    flatNode.childamount = node.children ? node.children.length : 0;

    flatNode.level = level;
    flatNode.expandable = !!node.children;

    return flatNode;
  }

  hasChild = (_: number, _nodeData: TranTypeTreeFlatNode) => { return _nodeData.expandable; };

  private _getLevel = (node: TranTypeTreeFlatNode) => { return node.level; };

  private _isExpandable = (node: TranTypeTreeFlatNode) => { return node.expandable; };

  private _getChildren = (node: TranTypeTreeNode): Observable<TranTypeTreeNode[]> => {
    return observableOf(node.children);
  }

  private _buildTypeTree(value: TranType[], level: number, id?: number): TranTypeTreeNode[] {
    let data: TranTypeTreeNode[] = [];

    if (id === undefined) {
      value.forEach((val: TranType) => {
        if (!val.ParId) {
          // Root nodes!
          let node: TranTypeTreeNode = new TranTypeTreeNode();
          node.displayname = val.FullDisplayText;
          node.id = val.Id;
          node.children = this._buildTypeTree(value, level + 1, val.Id);

          data.push(node);
        }
      });
    } else {
      value.forEach((val: TranType) => {
        if (val.ParId === id) {
          // Child nodes!
          let node: TranTypeTreeNode = new TranTypeTreeNode();
          node.displayname = val.FullDisplayText;
          node.id = val.Id;
          node.children = this._buildTypeTree(value, level + 1, val.Id);

          data.push(node);
        }
      });
    }

    return data;
  }
}