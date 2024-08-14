import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import { ObjectId } from 'mongodb'

async function query(filterBy = {}) {

  try {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('review')

    var reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        // This stage performs a left outer join ($lookup) with the 'users' collection. 
        // It matches documents from the 'review' collection with documents from the 'users'
        // collection where the byUserId field in the 'review' collection matches the _id field 
        // in the 'users' collection. The result is added to the byUser array.
        {
          $lookup: {
            localField: 'byUserId',
            from: 'user',
            foreignField: '_id',
            as: 'byUser',
          },
        },
        // This stage deconstructs the byUser array created by the $lookup stage, 
        // creating a new document for each element in the array. It effectively flattens the array, 
        // and each document now represents a combination of the original 'review' document 
        // and the corresponding 'users' document.
        {
          $unwind: '$byUser',
        },
        {
          $lookup: {
            localField: 'aboutToyId',
            from: 'toy',
            foreignField: '_id',
            as: 'aboutToy',
          },
        },
        {
          $unwind: '$aboutToy',
        },
        {
          $project: {
            _id: true,
            txt: 1,
            byUser: { _id: 1, fullname: 1 },
            aboutToy: { _id: 1, name: 1, price: 1 },
          },
        },
      ])
      .toArray()

    // reviews = reviews.map(review => {
    //   review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname }
    //   review.aboutToy = { _id: review.aboutToy._id, name: review.aboutToy.name, price: review.aboutToy.price }
    //   delete review.byUserId
    //   delete review.aboutToyId
    //   return review
    // })
    // console.log('reviews:', reviews)
    return reviews
  } catch (err) {
    logger.error('cannot find reviews', err)
    throw err
  }
}

async function remove(reviewId) {
  try {
    const { loggedinUser } = asyncLocalStorage.getStore()
    const collection = await dbService.getCollection('review')

    const criteria = { _id: ObjectId.createFromHexString(reviewId) }
    // remove only if user is owner/admin
    //* If the user is not admin, he can only remove his own reviews by adding byUserId to the criteria
    if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)

    const { deletedCount } = await collection.deleteOne(criteria)
    return deletedCount
  } catch (err) {
    logger.error(`cannot remove review ${reviewId}`, err)
    throw err
  }
}

async function add(review) {
  try {
    const reviewToAdd = {
      byUserId: ObjectId.createFromHexString(review.byUserId),
      aboutToyId: ObjectId.createFromHexString(review.aboutToyId),
      txt: review.txt,
    }
    const collection = await dbService.getCollection('review')
    await collection.insertOne(reviewToAdd)
    return reviewToAdd
  } catch (err) {
    logger.error('cannot insert review', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.byUserId) criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
  if (filterBy.aboutToyId) criteria.aboutToyId = ObjectId.createFromHexString(filterBy.aboutToyId)
  return criteria
}

export const reviewService = {
  query,
  remove,
  add,
}



