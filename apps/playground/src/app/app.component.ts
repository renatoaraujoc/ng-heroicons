import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    iconClass: NgClass['ngClass'] = 'text-red-500 w-8 h-auto';

    constructor() {
        setTimeout(() => {
            this.iconClass = 'text-red-500 w-12 h-auto';
        }, 4000);
    }
}
