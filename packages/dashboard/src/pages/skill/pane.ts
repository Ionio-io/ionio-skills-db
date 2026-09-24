/**
 * A scroller inside the skill page's reading pane. It stays locked until the pane is
 * pinned (its group carries `data-pinned`), so the wheel moves the page first, even
 * with the pointer over the document.
 */
export const PANE_SCROLLER = 'xl:overflow-y-hidden xl:group-data-pinned:overflow-y-auto';
