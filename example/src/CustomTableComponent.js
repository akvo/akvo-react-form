import React from 'react'
import {
  FieldGroupHeader,
  Question,
  DeleteSelectedRepeatButton,
  AkvoReactCard,
  AkvoReactTable
} from 'akvo-react-form'

const CustomTableComponent = ({
  index,
  group,
  forms,
  activeGroup,
  form,
  current,
  sidebar,
  updateRepeat,
  repeats,
  headStyle
}) => {
  let columns = [
    {
      title: 'Action',
      dataIndex: 'repeat',
      key: 'action',
      width: 5
    }
  ]
  const qColumns = group?.question?.map((q) => {
    return {
      title: q?.name,
      dataIndex: q?.id,
      key: q?.id
    }
  })
  columns = [...columns, ...qColumns]

  const dataSource = repeats.map((r) => {
    const sources = group?.question
      ?.map((q) => ({
        repeat: (
          <DeleteSelectedRepeatButton
            index={index}
            group={group}
            repeat={r}
            updateRepeat={updateRepeat}
          />
        ),
        [q?.id]: (
          <Question
            group={group}
            fields={[q]}
            cascade={forms.cascade}
            form={form}
            current={current}
            repeat={r}
          />
        )
      }))
      .reduce((res, val) => {
        const key = Object.keys(val)[0]
        return {
          ...res,
          [key]: val?.[key]
        }
      })
    return { key: r, ...sources }
  })

  return (
    <AkvoReactCard
      key={index}
      title={
        <FieldGroupHeader
          group={group}
          index={index}
          updateRepeat={updateRepeat}
        />
      }
      className={`arf-field-group ${
        activeGroup !== index && sidebar ? 'arf-hidden' : ''
      }`}
      headStyle={headStyle}
    >
      {group?.description ? (
        <p className='arf-description'>{group.description}</p>
      ) : (
        ''
      )}
      <AkvoReactTable
        showHeader={false}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </AkvoReactCard>
  )
}

export default CustomTableComponent
