import React from 'react'
import { Col, List } from 'antd'
import { MdRadioButtonChecked, MdCheckCircle } from 'react-icons/md'

const Sidebar = ({
  formsMemo,
  showGroup,
  activeGroup,
  setActiveGroup,
  completeGroup
}) => {
  return (
    <List
      bordered={false}
      header={<div className='arf-sidebar-header'>form overview</div>}
      dataSource={formsMemo?.question_group?.map((qg, qgi) => ({
        ...qg,
        appear: showGroup.includes(qgi)
      }))}
      renderItem={(item, key) =>
        item.appear && (
          <List.Item
            key={key}
            onClick={() => setActiveGroup(key)}
            className={`arf-sidebar-list ${
              activeGroup === key ? 'arf-active' : ''
            } ${
              completeGroup.includes(
                item?.repeatable ? `${key}-${item?.repeat}` : key
              )
                ? 'arf-complete'
                : ''
            }`}
          >
            {completeGroup.includes(
              item?.repeatable ? `${key}-${item?.repeat}` : key
            ) ? (
              <MdCheckCircle className='arf-icon' />
            ) : (
              <MdRadioButtonChecked className='arf-icon' />
            )}
            {item?.name || `Section ${key + 1}`}
          </List.Item>
        )
      }
    />
  )
}

export default Sidebar
