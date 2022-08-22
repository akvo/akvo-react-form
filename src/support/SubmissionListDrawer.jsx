import React, { useState } from 'react'
import { Drawer, Space, Button } from 'antd'

const DrawerToggle = ({ visible, setVisible }) => {
  return (
    <div
      className={`arf-submissions-drawer-toggle${visible ? '-close' : ''}`}
      onClick={() => setVisible(!visible)}
    ></div>
  )
}

const SubmissionListDrawer = () => {
  const [visible, setVisible] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // check screen size or mobile browser
  window.addEventListener('resize', () => {
    setWindowWidth(window.innerWidth)
  })

  return (
    <div>
      <DrawerToggle visible={visible} setVisible={setVisible} />
      <Drawer
        className='arf-submissions-drawer-container'
        title='Submissions'
        placement='left'
        width={windowWidth > 700 ? '450' : '75%'}
        visible={visible}
        zIndex='1002'
        onClose={() => setVisible(!visible)}
      >
        <DrawerToggle setVisible={setVisible} visible={visible} />
        <h3>Content</h3>
      </Drawer>
    </div>
  )
}

export default SubmissionListDrawer
