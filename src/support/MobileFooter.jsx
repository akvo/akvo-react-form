import React from 'react'
import { Row, Col, Button, Drawer, Space } from 'antd'
import { FiMenu } from 'react-icons/fi'
import Sidebar from './Sidebar'

const MobileFooter = ({
  isMobile,
  isSubmit,
  isMobileMenuVisible,
  setIsMobileMenuVisible,
  sidebarProps,
  lastGroup,
  form,
  onSave,
  isSave,
  isSaveFeatureEnabled
}) => {
  return (
    <Col span={24} className='arf-mobile-footer-container'>
      <Row justify='space-between' align='middle'>
        <Col span={10} align='start'>
          <Space size={5}>
            <Button
              type='link'
              icon={<FiMenu className='arf-icon' />}
              onClick={() => setIsMobileMenuVisible(!isMobileMenuVisible)}
            />
            <div>1 / 2</div>
          </Space>
        </Col>
        <Col span={14} align='end'>
          <Space style={{ float: 'right' }}>
            <Button
              className='next'
              size='large'
              type='default'
              // onClick={() => {
              //   setIsMobileMenuVisible(false)
              //   if (!lastGroup) {
              //     dispatch({
              //       type: 'UPDATE GROUP',
              //       payload: { active: active + 1 }
              //     })
              //   } else {
              //     form.submit()
              //   }
              // }}
              loading={lastGroup && isSubmit}
              disabled={lastGroup && (isSubmit || isSave)}
            >
              {!lastGroup ? 'Next' : 'Submit'}
            </Button>
            {isSaveFeatureEnabled && (
              <Button
                size='large'
                className='next'
                onClick={onSave}
                loading={isSave}
                disabled={isSave || isSubmit}
              >
                Save
              </Button>
            )}
          </Space>
        </Col>
      </Row>
      {/* Drawer menu */}
      <Drawer
        title={null}
        placement='bottom'
        closable={false}
        onClose={() => setIsMobileMenuVisible(false)}
        visible={isMobileMenuVisible}
        className='arf-sidebar arf-mobile'
        height='100%'
        zIndex='1001'
      >
        <Sidebar
          {...sidebarProps}
          isMobile={isMobile}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
        />
      </Drawer>
    </Col>
  )
}

export default MobileFooter
