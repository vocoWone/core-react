import {Reducer, combineReducers} from "redux";
import {ActionTypeView, LoadingStateView, StateView, StateActionPayloadView, LoadingActionView, ActionHandlerView} from "./type";
import {Exception, RuntimeException} from "./Exception";
import {LocationChangeAction, RouterState, push} from "connected-react-router";
import {Store} from "redux";
import {SagaIterator} from "redux-saga";
import {call, put, takeEvery} from "redux-saga/effects";

/** store */
let state: StateView = {app: {}, loading: {}, router: {} as any};
export const storeListener = (store: Store<StateView>) => () => {
    state = store.getState();
};

/** action */
export const LOADING_ACTION: string = "@@framework/loading";
export const ERROR_ACTION_TYPE: string = "@@framework/error";
const SET_STATE_ACTION: string = "@@framework/setState";
export function setStateAction(module: string, state: object, type: string): ActionTypeView<StateActionPayloadView> {
    return {
        type,
        name: SET_STATE_ACTION,
        payload: {module, state},
    };
}
export function setLoadingAction(identifier: string, hasShow: boolean): ActionTypeView<LoadingActionView> {
    return {
        type: LOADING_ACTION,
        payload: {identifier, hasShow},
    };
}
export function setErrorAction(error: any): ActionTypeView<Exception> {
    const exception: Exception = error instanceof Exception ? error : new RuntimeException(error && error.message ? error.message : "unknown error");
    return {
        type: ERROR_ACTION_TYPE,
        payload: exception,
    };
}

/** reducer */
export function appReducer(state: StateView["app"] = {}, action: ActionTypeView<any>): StateView["app"] {
    if (action.name === SET_STATE_ACTION) {
        const {module, state: moduleState} = action.payload as StateActionPayloadView;
        return {...state, [module]: {...state[module], ...moduleState}};
    }
    return state;
}
function loadingReducer(state: LoadingStateView = {}, action: ActionTypeView<any>): LoadingStateView {
    if (action.type === LOADING_ACTION) {
        const payload = action.payload as LoadingActionView;
        const count = state[payload.identifier] || 0;
        return {
            ...state,
            [payload.identifier]: count + (payload.hasShow ? 1 : -1),
        };
    }
    return state;
}
export function rootReducer(routerReducer: Reducer<RouterState, LocationChangeAction>): Reducer<StateView> {
    return combineReducers<StateView>({
        router: routerReducer,
        app: appReducer,
        loading: loadingReducer,
    });
}

/** saga */
export function* run(handler: ActionHandlerView, payload: any[]): SagaIterator {
    try {
        yield* handler(...payload);
    } catch (error) {
        console.error("Redux Saga Error");
        console.error(error);
        yield put(setErrorAction(error));
    }
}
export function* saga(handlers: ActionStore): SagaIterator {
    // trigger one time, in order to mount all actions.
    yield takeEvery("*", function*(action: ActionTypeView<any>): SagaIterator {
        // Mounted on the program, Dispatch & yield put triggers every time.
        const handler = handlers[action.type];
        if (handler) {
            yield call(run, handler, action.payload);
        }
    });
}

export class ActionStore {
    // 存储 actions方法名与 action方法的参数
    readonly actionType: {[type: string]: (...payload: any[]) => ActionTypeView<any[]>} = {};
    // 存储action方法体
    readonly actionHandler: {[type: string]: ActionHandlerView} = {};
}

abstract class LifeCycle {
    abstract onReady(): SagaIterator;
    abstract onLoad(): SagaIterator;
    abstract onUnload(): SagaIterator;
    abstract onHide(): SagaIterator;
    abstract onError(): SagaIterator;
}

export class Model<S extends object> implements LifeCycle {
    readonly module: string;
    private readonly initialState: S;

    public constructor(module: string, initialState: S) {
        this.module = module;
        this.initialState = initialState;
    }

    *onReady(): SagaIterator {
        // extends to be overrode
    }

    *onLoad(): SagaIterator {
        // extends to be overrode
    }

    *onUnload(): SagaIterator {
        // extends to be overrode
    }

    *onHide(): SagaIterator {
        // extends to be overrode
    }

    *onError(): SagaIterator {
        // extends to be overrode
    }

    protected get state(): Readonly<S> {
        return state.app[this.module];
    }

    protected *setState(newState: Partial<S>): SagaIterator {
        yield put(setStateAction(this.module, newState, `@@${this.module}/setState[${Object.keys(newState).join(",")}]`));
    }

    protected *setHistory(newURL: string): SagaIterator {
        yield put(push(newURL));
    }
}
