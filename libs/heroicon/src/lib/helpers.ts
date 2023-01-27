export const getElementExplicitDimensions = (
    element: Element
): {
    hasHeight: boolean;
    hasWidth: boolean;
} => {
    const clonedEl = element.cloneNode() as HTMLElement;
    clonedEl.innerHTML = '';
    clonedEl.style.visibility = 'hidden';
    clonedEl.style.position = 'absolute';
    document.body?.insertBefore(clonedEl, document.body?.nextSibling);

    const elementCss = window.getComputedStyle(element);
    const clonedCss = window.getComputedStyle(clonedEl);

    console.log({
        eH: elementCss.height,
        eW: elementCss.width,
        cH: clonedCss.height,
        cW: clonedCss.width
    });

    const ret = {
        hasHeight: elementCss.height === clonedCss.height,
        hasWidth: elementCss.width === clonedCss.width
    };

    // clonedEl.remove();

    return ret;
};
