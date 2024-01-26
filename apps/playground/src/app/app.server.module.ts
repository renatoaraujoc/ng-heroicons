import { APP_ID, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
    imports: [AppModule, ServerModule],
    bootstrap: [AppComponent],
    providers: [
        {
            provide: APP_ID,
            useValue: 'app'
        }
    ]
})
export class AppServerModule {}
