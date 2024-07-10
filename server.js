import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import { toyService } from './services/toy.service.js'
import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js'

const app = express()

const corsOptions = {
    origin: [
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://localhost:5173',
    ],
    credentials: true
}
app.use(cors(corsOptions))


// Express Config:
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

// REST API for toys

// toy LIST
app.get('/api/toy', (req, res) => {
    console.log('get list')

    const filterBy = {
        name: req.query.name || '',
        price: +req.query.price || 0,
        labels: req.query.labels || ''
    }

    const sortBy = {
        field: req.query.sortBy || 'name',
        dir: req.query.sortDir === 'desc' ? -1 : 1
    }

    console.log('filterBy:', filterBy)
    console.log('sortBy:', sortBy)

    toyService.query(filterBy, sortBy)
        .then((toys) => {
            res.send(toys)
        })
        .catch((err) => {
            loggerService.error('Cannot get toys', err)
            res.status(400).send('Cannot get toys')
        })
})
// toy find
app.get('/api/toy/:toyId', (req, res) => {
    const { toyId } = req.params
    toyService.getById(toyId)
        .then((toy) => {
            res.send(toy)
        })
        .catch((err) => {
            loggerService.error('Cannot get toy', err)
            res.status(500).send('Cannot get toy')
        })
})

// toy CREATE Post
app.post('/api/toy', (req, res) => {
    // const loggedinUser = userService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Cannot add toy')
    const toy = {
        name: req.body.name,
        price: +req.body.price,
        labels: req.body.labels || [],
        createdAt: req.body.createdAt ? +req.body.createdAt : Date.now()
    }
    toyService.save(toy)//loggedinUser
        .then((savedToy) => {
            res.send(savedToy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(500).send('Cannot save toy')
        })

})

// toy UPDATE
app.put('/api/toy', (req, res) => {
    // const loggedinUser = userService.validateToken(req.cookies.loginToken)
    // if (!loggedinUser) return res.status(401).send('Cannot update toy')
    const toy = {
        _id: req.body._id,
        name: req.body.name,
        price: +req.body.price,
        labels: req.body.labels || [],
        createdAt: req.body.createdAt ? +req.body.createdAt : Date.now()
    }
    toyService.save(toy)//loggedinUser
        .then((savedToy) => {
            res.send(savedToy)
        })
        .catch((err) => {
            loggerService.error('Cannot save toy', err)
            res.status(500).send('Cannot save toy')
        })

})

// toy DELETE
app.delete('/api/toy/:toyId', (req, res) => {
    // const loggedinUser = userService.validateToken(req.cookies.loginToken)
    // loggerService.info('loggedinUser toy delete:', loggedinUser)
    // if (!loggedinUser) {
    //     loggerService.info('Cannot remove toy, No user')
    //     return res.status(401).send('Cannot remove toy')
    // }

    const { toyId } = req.params
    toyService.remove(toyId)//, loggedinUser
        .then(() => {
            loggerService.info(`toy ${toyId} removed`)
            res.send(`Toy ${toyId} removed`)
        })
        .catch((err) => {
            loggerService.error('Cannot remove toy', err)
            res.status(400).send('Cannot remove toy')
        })

})


// AUTH API
// app.get('/api/user', (req, res) => {
//     userService.query()
//         .then((users) => {
//             res.send(users)
//         })
//         .catch((err) => {
//             loggerService.error('Cannot load users', err)
//             res.status(400).send('Cannot load users')
//         })
// })

// app.post('/api/auth/login', (req, res) => {
//     const credentials = req.body
//     userService.checkLogin(credentials)
//         .then(user => {
//             if (user) {
//                 const loginToken = userService.getLoginToken(user)
//                 res.cookie('loginToken', loginToken)
//                 res.send(user)
//             } else {
//                 loggerService.info('Invalid Credentials', credentials)
//                 res.status(401).send('Invalid Credentials')
//             }
//         })
// })

// app.post('/api/auth/signup', (req, res) => {
//     const credentials = req.body
//     userService.save(credentials)
//         .then(user => {
//             if (user) {
//                 const loginToken = userService.getLoginToken(user)
//                 res.cookie('loginToken', loginToken)
//                 res.send(user)
//             } else {
//                 loggerService.info('Cannot signup', credentials)
//                 res.status(400).send('Cannot signup')
//             }
//         })
// })

// app.post('/api/auth/logout', (req, res) => {
//     res.clearCookie('loginToken')
//     res.send('logged-out!')
// })

// app.get('/api/user/:userId', (req, res) => {
//     const { userId } = req.params
//     userService.getById(userId)
//         .then((user) => {
//             res.send(user)
//         })
//         .catch((err) => {
//             loggerService.error('Cannot get user', err)
//             res.status(400).send('Cannot get user')
//         })
// })

// app.put('/api/user', (req, res) => {
//     const loggedinUser = userService.validateToken(req.cookies.loginToken)
//     if (!loggedinUser) return res.status(400).send('No logged in user')
//     const { diff } = req.body
//     if (loggedinUser.score + diff < 0) return res.status(400).send('No credit')
//     loggedinUser.score += diff
//     return userService.save(loggedinUser).then(user => {
//         const token = userService.getLoginToken(user)
//         res.cookie('loginToken', token)
//         res.send(user)
//     })
// })

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


const PORT = 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)
