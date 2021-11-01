import { logger } from 'src/lib/logger'

module.exports = {
  command: async function (incomingData) {
    try {
      var data = incomingData.hashedPassword
      if (data.length === 0) {
        // if password is empty, remove it.
        delete incomingData.hashedPassword
      } else if (data.length < 4) {
        incomingData._error = {
          abort: true,
          message: 'Password not long enough.  Update not saved',
        }
      }
    } catch (e) {
      logger.error(e)
    }
    return await incomingData
  },
  active: true,
  order: 1,
  title: 'enforce Password',
  when: ['before'],
  type: ['update', 'create'],
  name: __filename,
  file: __filename,
}
