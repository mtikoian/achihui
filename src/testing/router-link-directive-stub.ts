import { Input, Directive, } from '@angular/core';

@Directive({
    selector: '[routerLink]',
    host: { '(click)': 'onClick()' }
})
export class RouterLinkDirectiveStub {
    @Input('routerLink') linkParams: any;
    navigatedTo: any = null;

    onClick(): void {
        this.navigatedTo = this.linkParams;
    }
}
