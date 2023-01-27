import {
    ModuleWithProviders,
    NgModule,
    Provider,
    SkipSelf
} from '@angular/core';
import { HI_ICON_SET_TOKEN, HI_OPTIONS_TOKEN } from './injection-tokens';
import { HeroIconComponent } from './components';
import { HeroIconIconSet, HeroIconOptions } from './types';

@NgModule({
    imports: [HeroIconComponent],
    exports: [HeroIconComponent]
})
export class HeroIconModule {
    static rootOptions: HeroIconOptions = {
        defaultHostDisplay: 'none',
        attachDefaultDimensionsIfNoneFound: false
    };

    /**
     * @param icons The list of icons to include
     * @param options The global options for this module
     */
    static forRoot(
        icons: HeroIconIconSet,
        options?: HeroIconOptions
    ): ModuleWithProviders<HeroIconModule> {
        options = options
            ? { ...HeroIconModule.rootOptions, ...options }
            : HeroIconModule.rootOptions;
        HeroIconModule.rootOptions = options;

        return {
            ngModule: HeroIconModule,
            providers: [
                {
                    provide: HI_ICON_SET_TOKEN,
                    useValue: icons,
                    multi: true
                },
                {
                    provide: HI_OPTIONS_TOKEN,
                    useValue: options
                }
            ]
        };
    }

    /**
     * Define the icons that you wish to include in the application.
     * Each module can choose which icons to include to improve
     * tree-shakability
     * @param icons The list of icons to include
     * @param options if should override any options
     */
    static withIcons(
        icons: HeroIconIconSet,
        options?: HeroIconOptions
    ): ModuleWithProviders<HeroIconModule> {
        return {
            ngModule: HeroIconModule,
            providers: [
                {
                    provide: HI_ICON_SET_TOKEN,
                    useValue: icons,
                    multi: true
                },
                options
                    ? {
                          provide: HI_OPTIONS_TOKEN,
                          useValue: {
                              ...HeroIconModule.rootOptions,
                              ...options
                          }
                      }
                    : []
            ]
        };
    }
}

/**
 * To be used everywhere to provide the icons **except** at Component providers.
 *
 * @see {@link provideComponentHeroIcons} explanation for more info on this.
 * @param icons The list of icons to include
 * @param options if should override any options
 */
export const provideHeroIcons = (
    icons: HeroIconIconSet,
    options?: HeroIconOptions
): Provider[] => [
    {
        provide: HI_ICON_SET_TOKEN,
        useValue: icons,
        multi: true
    },
    options
        ? {
              provide: HI_OPTIONS_TOKEN,
              useValue: options
          }
        : []
];

/**
 * To be **only** used in Component providers.
 * This function was created to make HeroIcons work NG14+.
 *
 * @see {@link https://github.com/angular/angular/issues/18894#issuecomment-338479099}
 * @param icons The list of icons to include
 * @param options if should override any options
 */
export const provideComponentHeroIcons = (
    icons: HeroIconIconSet,
    options?: HeroIconOptions
): Provider[] => [
    {
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
    },
    options
        ? {
              provide: HI_OPTIONS_TOKEN,
              useValue: {
                  ...HeroIconModule.rootOptions,
                  ...options
              }
          }
        : []
];
