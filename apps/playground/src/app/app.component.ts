import { Component } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    iconClass: NgClass['ngClass'] = 'text-red-500 w-4 h-4';

    constructor() {
        setTimeout(() => {
            this.iconClass = 'text-red-500 w-4 h-4';
        }, 1500);
    }
}
