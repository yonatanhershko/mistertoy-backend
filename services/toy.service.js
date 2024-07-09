
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

function query(filterBy = {}, sortBy = {}) {
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
            //         toy.labels.some(label => filterBy.labels.includes(label))
            //     )
            // }

            if (sortBy.field) {
                const sortDir = sortBy.dir
                toys = sortToys(toys, sortBy.field, sortDir)
                console.log('Sorting by:', sortBy.field)
            }

            // if (filterBy.pageIdx !== undefined) {
            //     const startIdx = filterBy.pageIdx * PAGE_SIZE
            //     toys = toys.slice(startIdx, startIdx + PAGE_SIZE)
            // }

            return toys
        })
}

function sortToys(toys, field, dir) {
    if (field === 'name') {
        return toys.sort((c1, c2) => c1.name.localeCompare(c2.name) * dir);
    } else if (field === 'price') {
        return toys.sort((c1, c2) => (c1.price - c2.price) * dir);
    } else if (field === 'createdAt') {
        return toys.sort((c1, c2) => (c1.createdAt - c2.createdAt) * dir);
    } else if (field === 'inStock') {
        return toys.sort((c1, c2) => (c1.inStock === c2.inStock ? 0 : c1.inStock ? -dir : dir));
    }
    return toys;
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
