import React, { useState } from 'react'
import { Drawer } from 'antd'

const DrawerToggle = ({ visible, setVisible, onShowStoredData }) => {
  return (
    <div
      className={`arf-submissions-drawer-toggle${visible ? '-close' : ''}`}
      onClick={() => {
        if (!visible) {
          onShowStoredData()
        }
        setVisible(!visible)
      }}
    ></div>
  )
}

const LeftDrawer = ({ title, content, onShowStoredData }) => {
  const [visible, setVisible] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // check screen size or mobile browser
  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth)
  })

  return (
    <div>
      <DrawerToggle
        visible={visible}
        setVisible={setVisible}
        onShowStoredData={onShowStoredData}
      />
      <Drawer
        className='arf-submissions-drawer-container'
        title={title || 'Submissions'}
        placement='left'
        width={windowWidth > 700 ? '450' : '75%'}
        visible={visible}
        zIndex='1002'
        onClose={() => setVisible(!visible)}
      >
        <DrawerToggle setVisible={setVisible} visible={visible} />
        {content}
      </Drawer>
    </div>
  )
}

export default LeftDrawer
