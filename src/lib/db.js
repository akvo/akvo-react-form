import Dexie from 'dexie'

const db = new Dexie('arf')

db.version(1).stores({
  data: 'id++, name, formId, created',
  values: 'id++, dataId, questionId, repeat, value'
})

export const checkDB = () =>
  Dexie.exists('arf')
    .then((exists) => {
      if (exists) {
        console.log('Database exists')
      } else {
        console.log("Database doesn't exist")
      }
    })
    .catch((e) => {
      console.error(
        'Oops, an error occurred when trying to check database existance'
      )
      console.error(e)
    })

const getQuestionDetail = (id) => {
  const question = id.toString().split('-')
  return {
    id: parseInt(question[0]),
    repeat: question.length === 2 ? parseInt(question[1]) : 0
  }
}

const listData = (formId) => db.data.where({ formId: formId }).toArray()

const newData = (formId, name) => {
  const data = db.data.add({
    name,
    formId
  })
  return data
}

const getValue = ({ dataId, questionId = null }) => {
  if (questionId) {
    const question = getQuestionDetail(questionId)
    return db.values.filter(
      (v) =>
        v.questionId === question.id &&
        v.dataId === dataId &&
        v.repeat === question.repeat
    )
  }
  return db.values.filter((v) => v.dataId === dataId)
}

const deleteData = (id) => {
  return new Promise((resolve, reject) => {
    db.data
      .delete(id)
      .then(() => {
        db.values
          .where({ dataId: id })
          .delete()
          .then(() => {
            resolve(id)
          })
          .catch((err) => {
            reject(err)
          })
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const saveValue = ({ dataId, questionId, value }) => {
  const question = getQuestionDetail(questionId)
  db.values
    .filter(
      (v) =>
        v.dataId === dataId &&
        v.questionId === question.id &&
        v.repeat === question.repeat
    )
    .delete()
  db.values.add({
    dataId: dataId,
    questionId: question.id,
    repeat: question.repeat,
    value: JSON.stringify(value)
  })
}

const ds = {
  list: listData,
  new: newData,
  get: (id) => getValue({ dataId: id }),
  delete: deleteData,
  value: {
    get: ({ dataId, questionId }) =>
      getValue({ dataId: dataId, questionId: questionId }),
    save: saveValue
  }
}
export default ds
