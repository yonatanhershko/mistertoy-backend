
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

const toys = utilService.readJsonFile('data/toy.json')
export const toyService = {
    query,
    getById,
    remove,
    save
}


function query(filterBy = {}) {
    return Promise.resolve(toys)
        .then(toys => {
            if (filterBy.name) {
                const regExp = new RegExp(filterBy.name, 'i')
                toys = toys.filter(toy => regExp.test(toy.name))
            }
            if (filterBy.price) {
                toys = toys.filter(toy => toy.price <= filterBy.price)
            }

            // if (filterBy.labels && filterBy.labels.length) {
            //     toys = toys.filter(toy =>
            //         toy.labels.some((label) =>{ console.log('toy test',toy);
            //             return filterBy.labels.includes(label)})

            //     ) 
            // }
            // if (filterBy.sortBy) {
            //     const sortDir = filterBy.sortDir === 'desc' ? -1 : 1
            //     toys = sortToys(toys, filterBy.sortBy, sortDir)
            // }

            // if (filterBy.pageIdx !== undefined) {
            //     const startIdx = filterBy.pageIdx * PAGE_SIZE
            //     toys = toys.slice(startIdx, startIdx + PAGE_SIZE)
            // }

            return toys
        })
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such toy')
    const toy = toys[idx]

    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)

        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        // toy.owner = {
        //     fullname: loggedinUser.fullname,
        //     score: loggedinUser.score,
        //     _id: loggedinUser._id,
        //     isAdmin: loggedinUser.isAdmin
        // }
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
