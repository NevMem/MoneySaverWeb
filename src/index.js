import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import { Provider } from 'react-redux' 
import { createStore } from 'redux'
import axios from 'axios'
import LoginPage from './LoginPage'
import api from './api'
import vars from './vars'

let codeDay = (date) => {
    return date.year + '-' + date.month + '-' + date.day
}

let reducer = (state, action) => {
    if (action.type === 'LOGGED_IN') {
        let { login, first_name, last_name, token } = action.payload

        loadData(token, login)
        loadInfo(token, login)

        return { ...state, login: login, token: token, first_name: first_name, last_name: last_name }
    } else if (action.type === 'LOGGED_OUT') {
        localStorage.removeItem('login')
        localStorage.removeItem('token')
        localStorage.removeItem('first_name')
        localStorage.removeItem('last_name')
        return { 
            ...state, 
            records: [], 
            counter: {}, 
            fullSum: 0, 
            average: 0, 
            countOfDays: 0, 
            differentDays: new Set(), 
            daySum: {}, 
            login: undefined, 
            token: undefined, 
            first_name: undefined, 
            last_name: undefined 
        }
    } else if (action.type === 'ADD_RECORD') {
        let { record } = action.payload
        state = { ...state, records: [ ...state.records, record ] }

        for (let tag of record.tags) {
            if (!state.counter[tag])
                state.counter[tag] = { sum: 0, count: 0 }
            state.counter[tag].sum += record.value
            state.counter[tag].count += 1
        }

        let cutted_date = record.date.year * 31 * 12 + record.date.month * 31 + record.date.day
        if (!state.differentDays.has(cutted_date))
            state.differentDays.add(cutted_date)
        // if (state.differentDays.size >= 2) {
            // let this_day = __get_prev_day(state.records[state.records.length - 2].date)
            // let encoded = this_day.year * 31 * 12 + this_day.month * 31 + this_day.day
            // while (!state.differentDays.has(encoded)) {
            //     let dayCode = codeDay(this_day)
            //     if (!state.daySum[dayCode])
            //         state.daySum[dayCode] = 0
            //     state.differentDays.add(encoded)
            //     this_day = __get_prev_day(this_day)
            //     encoded = this_day.year * 31 * 12 + this_day.month * 31 + this_day.day
            // }
        // }
        
        state.countOfDays = state.differentDays.size

        state.fullSum += record.value

        let dayCode = codeDay(record.date)
        if (!state.daySum[dayCode]) state.daySum[dayCode] = 0

        state.daySum[dayCode] += -record.value

        if (state.countOfDays > 0) {
            state.average = state.fullSum / state.countOfDays
            state.average = (state.average * 100 | 0) / 100.
        }

        return state
    } else if (action.type === 'BATCH_ADD') {
        let records = action.payload
        state = { 
            ...state, 
            records: [], 
            counter: {},
        }
        state = { ...state, records: [...state.records, ...records] }
        for (let i = 0; i !== records.length; ++i) {
            let record = records[i]
            for (let tag of record.tags) {
                if (!state.counter[tag])
                    state.counter[tag] = { sum: 0, count: 0 }
                state.counter[tag].sum += record.value
                state.counter[tag].count += 1
            }
        }
        return state
    } else if (action.type === 'CLEAR_DATA') {
        return { 
            ...state, 
            records: [], 
            counter: {}, 
            fullSum: 0, 
            average: 0, 
            countOfDays: 0, 
            differentDays: new Set(), 
            daySum: {}
        }
    } else if (action.type === vars.TOTAL_INFO) {
        const { payload } = action
        return { ...state, fullSum: payload.total, average: payload.average, countOfDays: payload.countOfDays }
    } else if (action.type === vars.DAY_SUM) {
        return { ...state, daySum: action.payload.daySum }
    }
    return state
}

const store = createStore(reducer, { 
        records: [], 
        counter: {}, 
        fullSum: 0, 
        average: 0, 
        countOfDays: 0, 
        differentDays: new Set(), 
        daySum: {} 
    }, 
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    )

function loadData(token, login) {
    let __start = Date.now()
    axios.post('/api/data', { token: token, login: login }).then(data => data.data)
    .then(data => {
        console.info('Loading data comsumed', Date.now() - __start)
        let start = Date.now()
        store.dispatch({ type: 'BATCH_ADD', payload: data })
        console.info('Adding all records consumed', Date.now() - start, 'milliseconds')
    }).catch(err => {
        console.log(err)
    })
}

function loadInfo(token, login) {
    api.loadInfo(token, login, { months: 'true', daysDescription: 'true' })
        .then(data => {
            const { totalSpend, amountOfDays, average } = data
            store.dispatch(vars.dispatchTotalInfo(totalSpend, amountOfDays, average))
            store.dispatch(vars.dispatchDaySum(data.daySum))
        })
        .catch(err => {
            console.log(err)
        })
}

let { token, first_name, last_name, login } = localStorage
if (token) {
    store.dispatch({ type: 'LOGGED_IN', payload: { login: login, token: token, first_name: first_name, last_name: last_name } })
}

const AuthenticatedRoute = ({component: Component, ...rest}) => {
    return <Route {...rest} render={(props) => ( store.getState().token !== undefined ? <Component {...props} /> : <Redirect to = '/' /> )} />
}

const UnauthenticatedRoute = ({component: Component, ...rest}) => {
    return <Route {...rest} render={(props) => ( store.getState().token === undefined ? <Component {...props} /> : <Redirect to = '/home' /> )} />
}

const Router = () => (
    <div>
        <UnauthenticatedRoute path = '/' component = {LoginPage} exact />
        <AuthenticatedRoute path = '/home' component = {App} exact />
    </div>
)

ReactDOM.render(
    <BrowserRouter>
        <Provider store = {store}>
            <Router/>
        </Provider>
    </BrowserRouter>
    , document.getElementById('root'))