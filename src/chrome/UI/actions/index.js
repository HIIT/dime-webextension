export const LOAD_PAGE_DATA = 'LOAD_PAGE_DATA'

export function loadPagerData (pageData) {
    return {
        type: LOAD_PAGE_DATA,
        payload: pageData
    }
}
