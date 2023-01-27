export type HeroIconHostDisplay = 'block' | 'inlineBlock' | 'none';
export type HeroIconIconType = 'outline' | 'solid';
export type HeroIconOptions = {
    /**
     * The default display mode for the host element.
     */
    defaultHostDisplay?: HeroIconHostDisplay;
    /**
     * This new option tries to figure out if the host element has
     * any sort of dimension, if it has not, it will attach default dimensions
     * to outline (h:24px, w:24px) or solid (h: 20px, w: 20px) icons automatically.
     * Passing any class or style with "width" or "height" will prevent this behavior.
     */
    attachDefaultDimensionsIfNoneFound?: boolean;
};

export type HeroIconIconSet = Record<
    string,
    { solid: string; outline: string }
>;
