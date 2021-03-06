import { Pipe, PipeTransform } from '@angular/core';
import { UIOrderForSelection, } from '../../model';
import * as moment from 'moment';

@Pipe({
  name: 'uiOrderValidFilter',
})
export class UIOrderValidFilterPipe implements PipeTransform {

  transform(allOrders: UIOrderForSelection[], args?: boolean): UIOrderForSelection[] {
    return allOrders ? allOrders.filter((value: UIOrderForSelection) => {
      const today: any = moment();

      if (args !== undefined) {
        if (args === true) {
          return value._validFrom.isBefore(today) && value._validTo.isAfter(today);
        } else {
          return true;
        }
      }

      return true;
    }) : [];
  }
}
