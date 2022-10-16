const cloud = require('wx-server-sdk')
cloud.init({
  env: 'text01-8g94lw8d90a79de6'
})
const db = cloud.database()
const _ = db.command
exports.main = async (event, context) => {
  try {
    return await db.collection('program_record')
      .where({
        _id: event._id,
        residueNum: _.gt(0)
      })
      .update({
        data: {
          volunteer:_.push(event.info),
          residueNum: _.inc(-1),
        },
      })
  } catch (e) {
    console.error(e)
  }
}