import { Component } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    emojiHappy,
    HeroIconComponent,
    provideHeroIconGlobalConfig
} from 'ng-heroicon';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-playground',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [HeroIconComponent],
    providers: [
        BrowserModule,
        provideHeroIconGlobalConfig(
            { emojiHappy },
            {
                defaultHostDisplay: 'block',
                attachDefaultDimensionsIfNoneFound: false
            }
        )
    ]
})
export class AppComponent {
    iconClass: NgClass['ngClass'] = 'text-red-500';

    constructor() {
        setTimeout(() => {
            this.iconClass = 'text-red-500';
        }, 1500);
    }
}
