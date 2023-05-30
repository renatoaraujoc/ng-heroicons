import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { emojiHappy, HeroIconModule, provideHeroIcons } from 'ng-heroicon';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        HeroIconModule
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
    providers: [provideHeroIcons({ emojiHappy })]
})
export class AppModule {}
