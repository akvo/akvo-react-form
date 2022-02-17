import React from 'react'
import {
  FieldGroupHeader,
  Question,
  AkvoReactCard,
  AkvoReactTable
} from 'akvo-react-form'
import range from 'lodash/range'

const CustomTableComponent = ({
  index,
  group,
  forms,
  activeGroup,
  form,
  current,
  sidebar,
  sticky,
  updateRepeat
}) => {
  const isRepeatable = group?.repeatable
  const repeats = range(isRepeatable ? group.repeat : 1)
  const headStyle =
    sidebar && isRepeatable
      ? {
          backgroundColor: '#fff',
          position: 'sticky',
          top: sticky ? '59px' : 0,
          zIndex: 9999
        }
      : {}

  const columns = group?.question?.map((q) => ({
    title: q?.name,
    dataIndex: q?.id,
    key: q?.id
  }))

  const dataSource = repeats.map((r) => {
    const sources = group?.question
      ?.map((q) => ({
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
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </AkvoReactCard>
  )
}

export default CustomTableComponent
