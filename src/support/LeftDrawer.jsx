import React, { useState } from 'react'
import { Drawer } from 'antd'

const DrawerToggle = ({ isLeftDrawerVisible, setIsLeftDrawerVisible }) => {
  return (
    <div
      className={`arf-submissions-drawer-toggle${
        isLeftDrawerVisible ? '-close' : ''
      }`}
      onClick={() => setIsLeftDrawerVisible(!isLeftDrawerVisible)}
    ></div>
  )
}

const LeftDrawer = ({
  title,
  content,
  isLeftDrawerVisible,
  setIsLeftDrawerVisible
}) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // check screen size or mobile browser
  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth)
  })

  return (
    <div>
      <DrawerToggle
        isLeftDrawerVisible={isLeftDrawerVisible}
        setIsLeftDrawerVisible={setIsLeftDrawerVisible}
      />
      <Drawer
        className='arf-submissions-drawer-container'
        title={title || 'Submissions'}
        placement='left'
        width={windowWidth > 700 ? '450' : '75%'}
        visible={isLeftDrawerVisible}
        zIndex='1002'
        onClose={() => setIsLeftDrawerVisible(!isLeftDrawerVisible)}
        destroyOnClose
      >
        <DrawerToggle
          setIsLeftDrawerVisible={setIsLeftDrawerVisible}
          isLeftDrawerVisible={isLeftDrawerVisible}
        />
        {content}
      </Drawer>
    </div>
  )
}

export default LeftDrawer
