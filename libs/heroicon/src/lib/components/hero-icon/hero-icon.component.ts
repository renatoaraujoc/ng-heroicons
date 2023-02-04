import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    Inject,
    Input,
    Optional,
    PLATFORM_ID,
    Renderer2,
    SecurityContext,
    ViewChild
} from '@angular/core';
import { HeroIconName } from '../../icons/icons-names';
import { HI_ICON_SET_TOKEN, HI_OPTIONS_TOKEN } from '../../injection-tokens';
import {
    HeroIconHostDisplay,
    HeroIconIconSet,
    HeroIconIconType,
    HeroIconOptions
} from '../../types';
import { RxState, selectSlice } from '@rx-angular/state';
import { DOCUMENT, isPlatformServer, JsonPipe, NgClass } from '@angular/common';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { LetModule } from '@rx-angular/template';
import dedent from 'dedent-js';
import { delay, ReplaySubject, switchMap, tap } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

interface State {
    hostDisplay: HeroIconHostDisplay;
    attachDefaultDimensionsIfNoneFound: boolean;
    rendered: {
        name: string | null;
        type: HeroIconIconType;
    };
    availableIcons: HeroIconIconSet;
    iconClass: NgClass['ngClass'];
    shouldAttachDimensions: boolean;
}

@Component({
    selector: 'hero-icon',
    standalone: true,
    template: `
        <ng-container *rxLet="vm$; let model">
            <!-- testSpan for autoDimensions -->
            <span
                [ngClass]="model.iconClass"
                #testSpan
                style="position: absolute;"
            ></span>
            <!-- the icon -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                [class.hi-d-outline]="
                    model.attachDefaultDimensionsIfNoneFound &&
                    model.shouldAttachDimensions &&
                    model.rendered.type === 'outline'
                "
                [class.hi-d-solid]="
                    model.attachDefaultDimensionsIfNoneFound &&
                    model.shouldAttachDimensions &&
                    model.rendered.type === 'solid'
                "
                [ngClass]="model.iconClass"
                [attr.viewBox]="
                    model.rendered.type === 'solid' ? '0 0 20 20' : '0 0 24 24'
                "
                stroke="currentColor"
                fill="none"
                #svgRef
            ></svg>
        </ng-container>
    `,
    styleUrls: ['./hero-icon.component.scss'],
    imports: [LetModule, NgClass, JsonPipe],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroIconComponent extends RxState<State> {
    static __instanceId = 0;

    // eslint-disable-next-line no-underscore-dangle
    _instanceId = ++HeroIconComponent.__instanceId;

    vm$ = this.select(
        selectSlice([
            'attachDefaultDimensionsIfNoneFound',
            'shouldAttachDimensions',
            'hostDisplay',
            'iconClass',
            'rendered'
        ])
    );

    @HostBinding('id')
    get instanceId() {
        return `heroicon-${this._instanceId}`;
    }

    @HostBinding('class.hi-d-block')
    get isDisplayBlock() {
        return this.get('hostDisplay') === 'block';
    }

    @HostBinding('class.hi-d-inline-block')
    get isDisplayInlineBlock() {
        return this.get('hostDisplay') === 'inlineBlock';
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
                dedent(`[${this.instanceId}] No icon named ${camelCasedIconName} was found. 
                Please refer to documentation on how to import it.`)
            );
            return;
        }
        this.__setIcon({ name: camelCasedIconName });
    }

    @Input() set type(type: HeroIconIconType) {
        this.__setIcon({ type });
    }

    @Input() set hostDisplay(hostDisplay: HeroIconHostDisplay) {
        this.set({ hostDisplay: hostDisplay ?? 'none' });
    }

    @Input() set attachDefaultDimensionsIfNoneFound(
        attachDefaultDimensionsIfNoneFound: boolean
    ) {
        this.set({
            attachDefaultDimensionsIfNoneFound: coerceBooleanProperty(
                attachDefaultDimensionsIfNoneFound
            )
        });
    }

    @Input() set iconClass(
        value:
            | string
            | string[]
            | Set<string>
            | {
                  [klass: string]: any;
              }
            | null
            | undefined
    ) {
        this.set({ iconClass: value });
    }

    #testSpanReady = new ReplaySubject();

    #testSpanRef: ElementRef<HTMLSpanElement>;

    /**
     * Every span element has a default width and height of 'auto',
     * so we fetch the height and width with the iconClass applyed into it, if any.
     * We can then figure out if any dimensions are passed.
     */
    @ViewChild('testSpan') set testSpanRef(
        testSpanRef: ElementRef<HTMLSpanElement>
    ) {
        this.#testSpanRef = testSpanRef;
        this.#testSpanReady.next(null);
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
        @Optional() @Inject(HI_OPTIONS_TOKEN) private _options: HeroIconOptions,
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
            attachDefaultDimensionsIfNoneFound:
                this._options?.attachDefaultDimensionsIfNoneFound ?? false,
            hostDisplay: this._options?.defaultHostDisplay ?? 'none',
            iconClass: null,
            shouldAttachDimensions: false
        });

        this.hold(
            this.#testSpanReady.pipe(
                switchMap(() => this.select('iconClass')),
                // Need 1 ms after applying the class for getComputedStyle to work
                delay(1),
                tap(() => {
                    this._calcShouldAttachDimensions();
                })
            )
        );
    }

    private __setIcon(icon: Partial<State['rendered']>) {
        this.set((oldState) => ({
            rendered: { ...oldState.rendered, ...icon }
        }));
    }

    private _calcShouldAttachDimensions() {
        if (isPlatformServer(this._platformId)) {
            this.set({ shouldAttachDimensions: false });
            return;
        }

        const window = this._document.defaultView as NonNullable<
            typeof this._document.defaultView
        >;

        const { height, width } = window.getComputedStyle(
            this.#testSpanRef.nativeElement
        );

        this.set({
            shouldAttachDimensions: height === 'auto' && width === 'auto'
        });
    }

    /**
     * Converts any string to camelCase.
     */
    private __toCamelCase = (str: string) =>
        str
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}
