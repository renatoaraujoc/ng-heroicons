import { InjectionToken } from '@angular/core';
import { HeroIconIconSet, HeroIconOptions } from './types';

export const HI_ICON_SET_TOKEN = new InjectionToken<HeroIconIconSet>(
    'HeroIconModule IconSet Token'
);
export const HI_OPTIONS_TOKEN = new InjectionToken<HeroIconOptions>(
    'HeroIconModule Options Token'
);
