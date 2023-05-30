import {
    FactoryProvider,
    ModuleWithProviders,
    NgModule,
    SkipSelf,
    ValueProvider
} from '@angular/core';
import { HI_ICON_SET_TOKEN } from './injection-tokens';
import { HeroIconComponent } from './components';
import { HeroIconIconSet } from './types';

@NgModule({
    imports: [HeroIconComponent],
    exports: [HeroIconComponent]
})
export class HeroIconModule {
    /**
     * @param icons The list of icons to include
     */
    static forRoot(
        icons: HeroIconIconSet
    ): ModuleWithProviders<HeroIconModule> {
        return {
            ngModule: HeroIconModule,
            providers: [
                {
                    provide: HI_ICON_SET_TOKEN,
                    useValue: icons,
                    multi: true
                }
            ]
        };
    }

    /**
     * Define the icons that you wish to include in the application.
     * Each module can choose which icons to include to improve
     * tree-shakability.
     *
     * @param icons The list of icons to include
     */
    static withIcons(
        icons: HeroIconIconSet
    ): ModuleWithProviders<HeroIconModule> {
        return {
            ngModule: HeroIconModule,
            providers: [
                {
                    provide: HI_ICON_SET_TOKEN,
                    useValue: icons,
                    multi: true
                }
            ]
        };
    }
}

/**
 * To be used everywhere to provide the icons **except** at Component providers.
 *
 * @see {@link provideComponentHeroIcons} explanation for more info on this.
 * @param icons The list of icons to include
 */
export const provideHeroIcons = (icons: HeroIconIconSet): ValueProvider => ({
    provide: HI_ICON_SET_TOKEN,
    useValue: icons,
    multi: true
});

/**
 * To be **only** used in Component providers.
 * This function was created to make HeroIcons work NG14+.
 *
 * @see {@link https://github.com/angular/angular/issues/18894#issuecomment-338479099}
 * @param icons The list of icons to include
 */
export const provideComponentHeroIcons = (
    icons: HeroIconIconSet
): FactoryProvider => ({
    provide: HI_ICON_SET_TOKEN,
    useFactory: (parentIcons: HeroIconIconSet[] = []) =>
        parentIcons.reduce(
            (acc, next) => ({
                ...acc,
                ...next
            }),
            icons
        ),
    deps: [[new SkipSelf(), HI_ICON_SET_TOKEN]],
    multi: true
});
