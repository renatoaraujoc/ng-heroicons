import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    inject,
    Inject,
    Input,
    Optional,
    PLATFORM_ID,
    Renderer2,
    SecurityContext,
    ViewChild
} from '@angular/core';
import { HeroIconName } from '../../icons/icons-names';
import { HI_ICON_SET_TOKEN } from '../../injection-tokens';
import { HeroIconIconSet, HeroIconIconType } from '../../types';
import { RxState, selectSlice } from '@rx-angular/state';
import { DOCUMENT, isPlatformServer, NgClass } from '@angular/common';
import { LetModule } from '@rx-angular/template/let';
import dedent from 'dedent-js';
import { DomSanitizer } from '@angular/platform-browser';
import { RxStrategyNames } from '@rx-angular/cdk/render-strategies/lib/model';

interface State {
    rendered: {
        name: string | null;
        type: HeroIconIconType;
    };
    availableIcons: HeroIconIconSet;
    iconClass: NgClass['ngClass'];
}

@Component({
    selector: 'hero-icon',
    standalone: true,
    template: `
        <svg
            *rxLet="vm$; let model; strategy: renderStrategy"
            xmlns="http://www.w3.org/2000/svg"
            [ngClass]="model.iconClass"
            [attr.width]="model.rendered.type === 'outline' ? '24px' : '20px'"
            [attr.height]="model.rendered.type === 'outline' ? '24px' : '20px'"
            [attr.viewBox]="
                model.rendered.type === 'outline' ? '0 0 24 24' : '0 0 20 20'
            "
            stroke="currentColor"
            fill="none"
            #svgRef
        ></svg>
    `,
    styleUrls: ['./hero-icon.component.scss'],
    imports: [LetModule, NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroIconComponent extends RxState<State> {
    static __instanceId = 0;

    renderStrategy: RxStrategyNames<any> = isPlatformServer(inject(PLATFORM_ID))
        ? 'native'
        : 'local';

    // eslint-disable-next-line no-underscore-dangle
    _instanceId = ++HeroIconComponent.__instanceId;

    vm$ = this.select(selectSlice(['iconClass', 'rendered']));

    @HostBinding('id')
    get instanceId() {
        return `heroicon-${this._instanceId}`;
    }

    @Input() set name(value: HeroIconName) {
        const camelCasedIconName = this.__toCamelCase(value);
        const availableIcons = this.get('availableIcons');

        if (
            !availableIcons ||
            !(camelCasedIconName in this.get('availableIcons'))
        ) {
            this.__setIcon({ name: null });
            console.error(
                dedent(`[${this.instanceId}] No icon named '${camelCasedIconName}' was found. 
                Please refer to documentation on how to import it.`)
            );
            return;
        }
        this.__setIcon({ name: camelCasedIconName });
    }

    @Input() set type(type: HeroIconIconType) {
        this.__setIcon({ type });
    }

    @Input() set iconClass(value: NgClass['ngClass']) {
        this.set({ iconClass: value });
    }

    #svgRef: ElementRef<SVGElement>;

    @ViewChild('svgRef') set svgRef(svgRef: ElementRef<SVGElement>) {
        if (svgRef) {
            this.#svgRef = svgRef;
            // Watches the changes on the informed icon and renders it, respecting SSR
            this.hold(this.select('rendered'), ({ name, type }) => {
                const iconHtml = this._domSanitizer.sanitize(
                    SecurityContext.HTML,
                    this._domSanitizer.bypassSecurityTrustHtml(
                        name !== null
                            ? this.get('availableIcons')[name][type]
                            : ''
                    )
                );
                // .innerHTML is not supported by SSR
                if (isPlatformServer(this._platformId)) {
                    const innerElement =
                        this._renderer.createElement('ng-container');
                    this._renderer.appendChild(
                        this.#svgRef.nativeElement,
                        innerElement
                    );
                    this._renderer.setProperty(
                        innerElement,
                        'outerHTML',
                        iconHtml
                    );
                    this._renderer.removeChild(
                        this.#svgRef.nativeElement,
                        innerElement
                    );
                } else {
                    this._renderer.setProperty(
                        this.#svgRef.nativeElement,
                        'innerHTML',
                        iconHtml
                    );
                }
            });
        }
    }

    constructor(
        @Optional()
        @Inject(HI_ICON_SET_TOKEN)
        private _iconSet: ReadonlyArray<HeroIconIconSet>,
        @Inject(DOCUMENT) private _document: Document,
        // eslint-disable-next-line @typescript-eslint/ban-types
        @Inject(PLATFORM_ID) private _platformId: Object,
        private _domSanitizer: DomSanitizer,
        private _renderer: Renderer2
    ) {
        super();

        if (!this._iconSet || this._iconSet.length === 0) {
            throw new Error(
                dedent(`
                    [HeroIcon] No iconSet has been provided!
                    There are many ways to provide the icons:
                    1. HeroIconModule.forRoot() for root module
                    2. HeroIconModule.withIcons() for childs modules
                    3. provideHeroIcons()
                    4. provideComponentHeroIcons()
                `)
            );
        }

        this.set({
            rendered: {
                name: null,
                type: 'outline'
            },
            availableIcons: this._iconSet.reduce((icons, iconset) => ({
                ...icons,
                ...iconset
            })),
            iconClass: null
        });
    }

    private __setIcon(icon: Partial<State['rendered']>) {
        this.set((oldState) => ({
            rendered: { ...oldState.rendered, ...icon }
        }));
    }

    /**
     * Converts any string to camelCase.
     */
    private __toCamelCase = (str: string) =>
        str
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}
