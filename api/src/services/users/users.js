import { db } from 'src/lib/db'
import { UserInputError } from '@redwoodjs/graphql-server'
import {
  executeBeforeCreateRules,
  executeAfterCreateRules,
  executeBeforeReadAllRules,
  executeAfterReadAllRules,
  executeBeforeReadRules,
  executeAfterReadRules,
  executeBeforeUpdateRules,
  executeAfterUpdateRules,
  executeBeforeDeleteRules,
  executeAfterDeleteRules,
} from 'src/lib/rules'
import CryptoJS from 'crypto-js'
let table = 'user'
export const createUser = async ({ input }) => {
  try {
    let result = await executeBeforeCreateRules(table, {
      input,
      status: { code: 'success', message: '' },
    })
    if (result.status.code !== 'success') {
      throw new UserInputError(result.status.message)
    }
    let record = await db[table].create({
      data: result.input,
    })
    let afterResult = await executeAfterCreateRules(table, {
      record,
    })
    return afterResult.record
  } catch (error) {
    throw new UserInputError(error.message)
  }
}

export const users = async ({ orderBy, filter, skip }) => {
  try {
    let preferences = context.currentUser.preferences
    let take = (() => {
      let limit = parseInt(preferences['user.pageSize'], 10) || 10
      if (limit > 100) {
        return 100 //return 100 or limit whatever is smaller
      } else {
        return limit
      }
    })()
    console.log('take', take)
    let where = (() => {
      if (filter) {
        let OR = [
          { email: { contains: filter } },
          { name: { contains: filter } },
        ]
        let castFilter = parseInt(filter, 10)
        if (isNaN(castFilter) === false) {
          OR.push({ id: { equals: castFilter } })
        }
        return { OR }
      } else {
        return {}
      }
    })()
    let result = await executeBeforeReadAllRules(table, {
      status: { code: 'success', message: '' },
    })
    if (result.status.code !== 'success') {
      throw new UserInputError(result.status.message)
    }
    let readRecords = await db[table].findMany({ take, where, orderBy, skip })
    readRecords = executeAfterReadAllRules(table, readRecords)
    let count = await db[table].count({ where })
    console.log(`There ${count} records on ${table} ${JSON.stringify(where)}`)
    return readRecords
  } catch (error) {
    throw new UserInputError(error.message)
  }
}

export const user = async ({ id }) => {
  try {
    let result = await executeBeforeReadRules(table, {
      id,
      status: { code: 'success', message: '' },
    })
    if (result.status.code !== 'success') {
      throw new UserInputError(result.status.message)
    }
    let readRecord = await db[table].findUnique({
      where: { id },
    })
    readRecord = executeAfterReadRules(table, readRecord)
    return readRecord
  } catch (error) {
    throw new UserInputError(error.message)
  }
}

export const updateUser = async ({ id, input }) => {
  try {
    let result = await executeBeforeUpdateRules(table, {
      id,
      input,
      status: { code: 'success', message: '' },
    })
    if (result.status.code !== 'success') {
      throw new UserInputError(result.status.message)
    }
    let updatedRecord = await db[table].update({
      data: result.input,
      where: { id },
    })
    updatedRecord = executeAfterUpdateRules(table, updatedRecord)
    return updatedRecord
  } catch (error) {
    throw new UserInputError(error.message)
  }
}

export const deleteUser = async ({ id }) => {
  try {
    let result = await executeBeforeDeleteRules(table, {
      id,
      status: { code: 'success', message: '' },
    })
    if (result.status.code !== 'success') {
      throw new UserInputError(result.status.message)
    }
    let deletedRecord = await db[table].delete({
      where: { id },
    })
    deletedRecord = executeAfterDeleteRules(table, deletedRecord)
    return deletedRecord
  } catch (error) {
    throw new UserInputError(error.message)
  }
}

export const User = {
  GroupMember: (_obj, { root }) =>
    db.user.findUnique({ where: { id: root.id } }).GroupMember(),
  Preference: (_obj, { root }) =>
    db.user.findUnique({ where: { id: root.id } }).Preference(),
  md5Email: (_args, { root }) => CryptoJS.MD5(root.email).toString(),
}
