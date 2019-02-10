import axios from 'axios'

function loadTags(token, login) {
    return new Promise((resolve, reject) => {
        axios.post('/api/tags', { token, login })
            .then(data => data.data)
            .then(data => {
                if (data.type === 'ok')
                    resolve(data.data)
                else if (data.type === 'error')
                    reject(data.error)
                else
                    reject('server response has unknown format')
            })
            .catch(err => {
                reject(err)
            })
    })
}

function addTag(token, login, tag) {
    return new Promise((resolve, reject) => {
        axios.post('/api/addTag', { token, login, tagName: tag })
            .then(data => data.data)
            .then(data => {
                if (data.type === 'ok')
                    resolve(data.data)
                else if (data.type === 'error')
                    reject(data.error)
                else
                    reject('server reponse has unknown format')
            })
            .catch(err => {
                reject(err + '')
            })
    })
}

function createTemplate(token, login, name, value, wallet, tag) {
    return new Promise((resolve, reject) => {
        axios.post('/api/createTemplate', { token, login, name, value, wallet, tag })
            .then(data => data.data)
            .then(data => {
                if (data.type === 'ok') {
                    resolve('Your template was successfully added')
                } else if (data.type === 'error') {
                    reject(data.error)
                } else {
                    reject('Server reponse has unknown format')
                }
            })
            .catch(err => {
                reject(err + '')
            })
    })
}

function loadTemplates(token, login) {
    return new Promise((resolve, reject) => {
        axios.post('/api/templates', { token, login })
            .then(data => data.data)
            .then(data => {
                if (data.type === 'ok')
                    resolve(data.data)
                else if (data.type === 'error')
                    reject(data.error)
                else
                    reject('server response has unknown format')
            })
            .catch(err => {
                reject(err)
            })
    })
}

export default { loadTags, addTag, createTemplate, loadTemplates }