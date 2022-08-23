import Dexie from 'dexie'
import GlobalStore from './store'

const db = new Dexie('arf')

db.version(1).stores({
  data: 'id++, name, formId, current, created',
  values: 'id++, [dataId+questionId+repeat], value'
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

const newData = (formId, name) => {
  db.data
    .where({ current: 1 })
    .modify({ current: 0 })
    .then(() => {
      db.data.add({
        name,
        formId,
        current: 1,
        created: Date.now()
      })
      GlobalStore.update((s) => {
        s.initialValue = []
      })
    })
  return true
}

const getId = (name) => {
  return new Promise((resolve, reject) => {
    db.data.get({ name: name }).then((d) => {
      if (!d) {
        reject(d)
      }
      resolve(d)
    })
  })
}

const getValue = ({ dataId, questionId = null }) => {
  if (questionId) {
    const question = getQuestionDetail(questionId)
    return db.values
      .filter(
        (v) =>
          v.questionId === question.id &&
          v.dataId === dataId &&
          v.repeat === question.repeat
      )
      .first()
  }
  return new Promise((resolve) => {
    db.data
      .where({ current: 1 })
      .modify({ current: 0 })
      .then(() =>
        db.data
          .where({ id: dataId })
          .modify({ current: 1 })
          .then(() => {
            db.values
              .filter((v) => v.dataId === dataId)
              .toArray()
              .then((v) => {
                const data = v.map((q) => ({
                  question: q.questionId,
                  repeatIndex: q.repeat,
                  value: JSON.parse(q.value)
                }))
                GlobalStore.update((s) => {
                  s.initialValue = data
                  s.isLeftDrawerVisible = false
                })
                resolve(data)
              })
          })
      )
  })
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

const saveValue = ({ questionId, value }) => {
  value = JSON.stringify(value)
  const question = getQuestionDetail(questionId)
  return new Promise((resolve, reject) => {
    db.data.get({ current: 1 }).then((data) => {
      const existing = db.values.where({
        dataId: data.id,
        questionId: question.id,
        repeat: question.repeat
      })
      existing.first().then((a) => {
        if (a) {
          existing
            .modify({
              value: value
            })
            .then(() => {
              resolve(true)
            })
        } else {
          db.values
            .add({
              dataId: data.id,
              questionId: question.id,
              repeat: question.repeat,
              value: value
            })
            .then(() => {
              resolve(true)
            })
            .catch((err) => reject(err))
        }
      })
    })
  })
}

const updateValue = ({ value }) => {
  const data = Object.keys(value).map((v) => ({
    questionId: v,
    value: value[v]
  }))
  if (data.length) {
    return saveValue(data[0])
  }
  return false
}

const listData = (formId) => {
  return new Promise((resolve, reject) => {
    const list = db.data.where({ formId: formId }).toArray()
    list
      .then((values) => {
        if (values.length) {
          resolve(
            values.map((v) => ({
              ...v,
              load: () => getValue({ dataId: v.id }),
              remove: () => deleteData(v.id)
            }))
          )
        } else {
          reject(values)
        }
      })
      .catch((err) => reject(err))
  })
}

const ds = {
  list: listData,
  new: newData,
  getId: getId,
  get: (id) => getValue({ dataId: id }),
  remove: deleteData,
  disable: () => db.data.where({ current: 1 }).modify({ current: 0 }),
  value: {
    get: ({ dataId, questionId }) =>
      getValue({ dataId: dataId, questionId: questionId }),
    update: updateValue,
    save: saveValue
  }
}
export default ds
