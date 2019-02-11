import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter, Route, Redirect } from 'react-router-dom'
import { Provider } from 'react-redux' 
import { createStore } from 'redux'
import axios from 'axios'
import LoginPage from './LoginPage'

let codeDay = (date) => {
    return date.year + '-' + date.month + '-' + date.day
}

let __is_leap_year = year => {
    if (year % 400 === 0)
        return true
    if (year % 100 === 0)
        return false
    if (year % 4 === 0)
        return true
    return false
}

let __is_before = (first, second) => {
    if (first.year < second.year)
        return true
    if (first.year > second.year)
        return false
    if (first.month < second.month)
        return true
    if (first.month > second.month)
        return false
    if (first.day >= second.day)
        return false
    return true
}

let __is_to_day_equal = (first, second) => {
    return first.year === second.year && first.month === second.month && first.day === second.day
}

const __days_in_month = {
    1: 31,  // Jan
    2: 28,  // Feb
    3: 31,  // Mar
    4: 30,  // Apr
    5: 31,  // May
    6: 30,  // Jun
    7: 31,  // Jul
    8: 31,  // Aug
    9: 30,  // Sep
    10: 31, // Oct
    11: 30, // Nov
    12: 31 // Dec
}

let __get_prev_day = from => {
    let current = Object.assign({}, from)
    if (current.day === 1) {
        if (current.month === 3) {
            if (__is_leap_year(current.year)) {
                current.month -= 1
                current.day = 29
            } else {
                current.month -= 1
                current.day = 28
            }
        } else if (current.month === 1) {
            current.month = 12
            current.day = 31
            current.year -= 1
        } else {
            current.month -= 1
            current.day = __days_in_month[current.month]
        }
        return current
    } else {
        current.day -= 1
        return current
    }
}

let reducer = (state, action) => {
    if (action.type === 'LOGGED_IN') {
        let { login, first_name, last_name, token } = action.payload

        loadData(login, token)

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
        for (let i = 0; i !== records.length; ++i) {
            if (!records[i].tags) records[i].tags = [ "Not set" ]
        }
        state = { ...state, records: [...state.records, ...records] }
        for (let i = 0; i !== records.length; ++i) {
            let record = records[i]
            let cutted_date = record.date.year * 31 * 12 + record.date.month * 31 + record.date.day
            if (!state.differentDays.has(cutted_date))
                state.differentDays.add(cutted_date)
            for (let tag of record.tags) {
                if (!state.counter[tag])
                    state.counter[tag] = { sum: 0, count: 0 }
                state.counter[tag].sum += record.value
                state.counter[tag].count += 1
            }
            let dayCode = codeDay(record.date)
            if (!state.daySum[dayCode])
                state.daySum[dayCode] = 0
            state.daySum[dayCode] += -record.value
            state.fullSum += record.value
        }
        state.countOfDays = state.differentDays.size

        if (state.countOfDays >= 2) {
            let min_date = Object.assign({}, state.records[0].date)
            let max_date = Object.assign({}, state.records[0].date)
            for (let i = 0; i !== state.records.length; ++i) {
                if (__is_before(state.records[i].date, min_date))
                    min_date = Object.assign({}, state.records[i].date)
                if (__is_before(max_date, state.records[i].date))
                    max_date = Object.assign({}, state.records[i].date)
            }
            if (!__is_to_day_equal(min_date, max_date)) {
                let this_day = max_date
                while (__is_before(min_date, this_day)) {
                    let dayCode = codeDay(this_day)                    
                    let encoded = this_day.year * 31 * 12 + this_day.month * 31 + this_day.day
                    if (!state.daySum[dayCode])
                        state.daySum[dayCode] = 0
                    state.differentDays.add(encoded)    
                    this_day = __get_prev_day(this_day)
                }
            }
        }
        let buffer = []
        for (let el in state.daySum)
            buffer.push([ el, state.daySum[el] ])
        buffer.sort((first, second) => {
            let first_buffer = first[0].split('-')
            let second_buffer = second[0].split('-')
            let first_date = { year: parseInt(first_buffer[0], 10), month: parseInt(first_buffer[1], 10), day: parseInt(first_buffer[2], 10) }
            let second_date = { year: parseInt(second_buffer[0], 10), month: parseInt(second_buffer[1], 10), day: parseInt(second_buffer[2], 10) }
            if (__is_before(first_date, second_date))
                return 1
            if (__is_to_day_equal(first_date, second_date))
                return 0
            return -1
        })
        state.daySum = {}
        for (let i = 0; i !== buffer.length; ++i) {
            state.daySum[buffer[i][0]] = buffer[i][1]
        }
        state.countOfDays = state.differentDays.size
        if (state.countOfDays > 0) {
            state.average = state.fullSum / state.countOfDays
            state.average = (state.average * 100 | 0) / 100.
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

function loadData(login, token) {
    let __start = Date.now()
    axios.post('/api/data', { token: token, login: login }).then(data => data.data)
    .then(data => {
        console.info('Loading data comsumed', Date.now() - __start)
        let start = Date.now()
        store.dispatch({ type: 'CLEAR_DATA' })
        store.dispatch({ type: 'BATCH_ADD', payload: data })
        console.info('Adding all records consumed', Date.now() - start, 'milliseconds')
    }).catch(err => {
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
    , document.getElementById('root'));
// registerServiceWorker();
