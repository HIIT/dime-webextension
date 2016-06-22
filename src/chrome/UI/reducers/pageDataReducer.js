import { LOAD_PAGE_DATA } from "../actions"

export default function(state = {}, action) {
    switch (action.type) {
        case LOAD_PAGE_DATA:
            return action.payload
        default:
            return state
    }
}

