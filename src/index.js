import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { BrowserRouter, Route } from 'react-router-dom'
import { Provider } from 'react-redux' 
import { createStore } from 'redux'
import axios from 'axios'

let codeDay = (date) => {
    return date.year + '-' + date.month + '-' + date.day
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
        return { ...state, records: [], counter: {}, fullSum: 0, average: 0, countOfDays: 0, differentDays: new Set(), daySum: {}, login: undefined, token: undefined, first_name: undefined, last_name: undefined }
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
    }
    return state
}

const store = createStore(reducer, { records: [], counter: {}, fullSum: 0, average: 0, countOfDays: 0, differentDays: new Set(), daySum: {} }, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

function loadData(login, token) {
    axios.post('/api/data', { token: token, login: login }).then(data => data.data)
    .then(data => {
        for (let el of data) {
            store.dispatch({ type: 'ADD_RECORD', payload: { record: el } })
        }
    }).catch(err => {
        console.log(err)
    })
}

let { token, first_name, last_name, login } = localStorage
if (token) {
    store.dispatch({ type: 'LOGGED_IN', payload: { login: login, token: token, first_name: first_name, last_name: last_name } })
}

ReactDOM.render(
    <BrowserRouter>
        <Provider store = {store}>
            <Route path = '/' component = {App} />
        </Provider>
    </BrowserRouter>
    , document.getElementById('root'));
// registerServiceWorker();
