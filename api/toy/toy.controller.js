import { toyService } from './toy.service.js'
import { logger } from '../../services/logger.service.js'



//getall

export async function getToys(req, res) {
    try {
        const filterBy = {
            name: req.query.name || '',
            price: +req.query.price || 0,
            labels: req.query.labels || ''
        }

        const sortBy = {
            field: req.query.sortBy || 'name',
            dir: req.query.sortDir === 'desc' ? -1 : 1
        }
        const toys = await toyService.query(filterBy, sortBy)
        res.json(toys)
    } catch (err) {
        logger.error('Failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}


//find by id
export async function getToyById(req, res) {
    try {
        const toyId = req.params.id
        const toy = await toyService.getById(toyId)
        res.json(toy)
    } catch (err) {
        logger.error('Failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy' })
    }
}


//add
export async function addToy(req, res) {
    const { loggedinUser } = req

    try {
        const toy = {
            name: req.body.name,
            price: +req.body.price,
            labels: req.body.labels || [],
            createdAt: req.body.createdAt ? +req.body.createdAt : Date.now(),
            bgColor: req.body.bgColor || 'white',
            inStock: req.body.inStock || true,
            msgs: req.body.msgs || [],

        }
        toy.owner = loggedinUser
        const addedToy = await toyService.add(toy)
        res.json(addedToy)
    } catch (err) {
        logger.error('Failed to add toy', err)
        res.status(500).send({ err: 'Failed to add toy' })
    }
}


//updata
export async function updateToy(req, res) {
    try {
        const toy = {
            _id: req.body._id,
            name: req.body.name,
            price: +req.body.price,
            labels: req.body.labels || [],
            createdAt: req.body.createdAt ? +req.body.createdAt : Date.now(),
            bgColor: req.body.bgColor || 'white',
            inStock: req.body.inStock || true,
            msgs: req.body.msgs || [],

        }
        const updatedToy = await toyService.update(toy)
        res.json(updatedToy)
    } catch (err) {
        logger.error('Failed to update toy', err)
        res.status(500).send({ err: 'Failed to update toy' })
    }
}


//delete
export async function removeToy(req, res) {
    try {
        const toyId = req.params.id
        const deletedCount = await toyService.remove(toyId)
        res.send(`${deletedCount} toys removed`)
    } catch (err) {
        logger.error('Failed to remove toy', err)
        res.status(500).send({ err: 'Failed to remove toy' })
    }
}


//msg
export async function addToyMsg(req, res) {
    console.log('hello');
    const { loggedinUser } = req
    const { _id, fullname } = loggedinUser
    try {
      const toyId = req.params.id
      const msg = {
        txt: req.body.txt,
        by: { _id, fullname },
      }
      const savedMsg = await toyService.addToyMsg(toyId, msg)
    //   console.log(savedMsg)
      res.json(savedMsg)
    } catch (err) {
      logger.error("Failed to update toy", err)
      res.status(500).send({ err: "Failed to update toy" })
    }
  }
  
  export async function removeToyMsg(req, res) {
    const { loggedinUser } = req
    try {
      const toyId = req.params.id
      const { msgId } = req.params
  
      const removedId = await toyService.removeToyMsg(toyId, msgId)
      res.send(removedId)
    } catch (err) {
      logger.error("Failed to remove toy msg", err)
      res.status(500).send({ err: "Failed to remove toy msg" })
    }
  }
  