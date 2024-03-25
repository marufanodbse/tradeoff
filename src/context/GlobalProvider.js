import { createContext, useContext, useReducer, useMemo, useCallback } from 'react'

const UPDATE = 'UPDATE';
const GlobalProvider = createContext();

function useGlobalContext() {
    return useContext(GlobalProvider)
}

const global_init = {
    account: "",
};

function reducer(state, { type, payload }) {
    switch (type) {
        case UPDATE: {
            return { ...state, ...payload }
        }
        default: {
            throw Error(`Unexpected action type in GlobalContext reducer: '${type}'.`)
        }
    }
}

export default function Provider({ children }) {
    const [state, dispatch] = useReducer(reducer, global_init)

    const update = useCallback(payload => {
        dispatch({ type: UPDATE, payload })
    }, []);

    return (
        <GlobalProvider.Provider value={useMemo(() => [state, { update }], [state, update])}>
            {children}
        </GlobalProvider.Provider>
    )
}

export function useGlobal() {
    const [state,] = useGlobalContext()
    return state
}

export function useUpdateGlobal() {
    const [, { update }] = useGlobalContext()
    return update
}
