import { APP_ID, NgModule } from '@angular/core';
import {
    adjustments,
    emojiHappy,
    HeroIconModule,
    provideHeroIcons
} from 'ng-heroicon';
import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    imports: [BrowserModule, HeroIconModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    providers: [
        {
            provide: APP_ID,
            useValue: 'app'
        },
        provideHeroIcons({ emojiHappy, adjustments })
    ]
})
export class AppModule {}
