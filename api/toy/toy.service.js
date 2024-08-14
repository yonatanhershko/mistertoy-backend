import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

export const toyService = {
	remove,
	query,
	getById,
	add,
	update,
	addToyMsg,
	removeToyMsg,
	addToyMsg,
    removeToyMsg,
}

async function query(filterBy = { name: '' }, sortBy = {}) {
	try {
		const collection = await dbService.getCollection('toy')

		let criteria = {}
		if (filterBy.name) {
			criteria.name = { $regex: filterBy.name, $options: 'i' }
		}
		if (filterBy.price) {
			criteria.price = { $lte: filterBy.price }
		}
		if (filterBy.labels && filterBy.labels.length) {
			criteria.labels = { $all: filterBy.labels }
		}

		let sortCriteria = {}
		if (sortBy.field) {
			sortCriteria[sortBy.field] = sortBy.dir === 'desc' ? -1 : 1
			console.log('Sorting by:', sortBy.field)
		}

		const toys = await collection.find(criteria).sort(sortCriteria).toArray()
		return toys
	} catch (err) {
		logger.error('cannot find toys', err)
		throw err
	}
}

async function getById(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
		toy.createdAt = toy._id.getTimestamp()
		return toy
	} catch (err) {
		logger.error(`while finding toy ${toyId}`, err)
		throw err
	}
}

async function remove(toyId) {
	try {
		const collection = await dbService.getCollection('toy')
		const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
		return deletedCount
	} catch (err) {
		logger.error(`cannot remove toy ${toyId}`, err)
		throw err
	}
}

async function add(toy) {
	try {
		const collection = await dbService.getCollection('toy')
		await collection.insertOne(toy)
		return toy
	} catch (err) {
		logger.error('cannot insert toy', err)
		throw err
	}
}

async function update(toy) {
	try {
		const toyToSave = {
			name: toy.name,
			price: toy.price,
		}
		const collection = await dbService.getCollection('toy')
		await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToSave })
		return toy
	} catch (err) {
		logger.error(`cannot update toy ${toyId}`, err)
		throw err
	}
}

async function addToyMsg(toyId, msg) {
	try {
	  msg.id = utilService.makeId()
	  const collection = await dbService.getCollection("toy")
	  await collection.updateOne(
		{ _id: ObjectId.createFromHexString(toyId) },
		{ $push: { msgs: msg } }
	  )
	  return msg
	} catch (err) {
	  logger.error(`cannot add toy msg ${toyId}`, err)
	  throw err
	}
  }
  
  async function removeToyMsg(toyId, msgId) {
	try {
	  const collection = await dbService.getCollection("toy")
	  await collection.updateOne(
		{ _id: ObjectId.createFromHexString(toyId) },
		{ $pull: { msgs: { id: msgId } } }
	  )
	  return msgId
	} catch (err) {
	  logger.error(`cannot remove toy msg ${toyId}`, err)
	  throw err
	}
  }

export function makeId(length = 5) {
	var txt = ''
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (let i = 0; i < length; i++) {
		txt += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return txt
}