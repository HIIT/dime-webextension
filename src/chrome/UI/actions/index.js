export const LOAD_PAGE_DATA = 'LOAD_PAGE_DATA'

export function loadPageData (pageData) {
    return {
        type: LOAD_PAGE_DATA,
        payload: pageData
    }
}
