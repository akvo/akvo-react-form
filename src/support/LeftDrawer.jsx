import React, { useState, useMemo } from 'react'
import { Drawer, Row, Spin } from 'antd'

const DrawerToggle = ({
  isLeftDrawerVisible,
  setIsLeftDrawerVisible,
  onShowStoredData
}) => {
  return (
    <div
      className={`arf-submissions-drawer-toggle${
        isLeftDrawerVisible ? '-close' : ''
      }`}
      onClick={() => {
        if (!isLeftDrawerVisible) {
          onShowStoredData()
        }
        setIsLeftDrawerVisible(!isLeftDrawerVisible)
      }}
    ></div>
  )
}

const LeftDrawer = ({
  title,
  content,
  onShowStoredData,
  isLeftDrawerVisible,
  setIsLeftDrawerVisible
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // check screen size or mobile browser
  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth)
  })

  const isLoading = useMemo(() => {
    return !content?.props?.dataPoints?.length
  }, [content?.props?.dataPoints])

  return (
    <div>
      <DrawerToggle
        isLeftDrawerVisible={isLeftDrawerVisible}
        setIsLeftDrawerVisible={setIsLeftDrawerVisible}
        onShowStoredData={onShowStoredData}
      />
      <Drawer
        className='arf-submissions-drawer-container'
        title={title || 'Submissions'}
        placement='left'
        width={windowWidth > 700 ? '450' : '75%'}
        visible={isLeftDrawerVisible}
        zIndex='1002'
        onClose={() => setIsLeftDrawerVisible(!isLeftDrawerVisible)}
      >
        <DrawerToggle
          setIsLeftDrawerVisible={setIsLeftDrawerVisible}
          isLeftDrawerVisible={isLeftDrawerVisible}
          onShowStoredData={onShowStoredData}
        />
        {isLoading ? (
          <Row align='middle' justify='center' style={{ padding: 24 }}>
            <Spin />
          </Row>
        ) : (
          content
        )}
      </Drawer>
    </div>
  )
}

export default LeftDrawer
