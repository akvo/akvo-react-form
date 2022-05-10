import React, { useState, useMemo, useEffect } from 'react'
import ReactDOM from 'react-dom'

const IFrame = ({ children }) => {
  const [iframeBody, setIframeBody] = useState(null)
  const [ref, setRef] = useState(null)
  const head = ref?.contentDocument?.head
  const body = ref?.contentDocument?.body
  const handleBrowsers = ['firefox', 'chrome']

  const browser = useMemo(() => {
    let userAgent = navigator.userAgent
    let browserName
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = 'chrome'
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = 'firefox'
    } else if (userAgent.match(/safari/i)) {
      browserName = 'safari'
    } else if (userAgent.match(/opr\//i)) {
      browserName = 'opera'
    } else if (userAgent.match(/edg/i)) {
      browserName = 'edge'
    } else {
      browserName = 'No browser detection'
    }
    return browserName
  }, [])

  const isBraveBrowser = useMemo(() => {
    return navigator.brave && await navigator.brave.isBrave()
  }, [])

  useEffect(() => {
    // apply page css into print content
    if (head && !handleBrowsers.includes(browser) || isBraveBrowser) {
      let css = '@page {'
      css += 'size: 210mm 297mm; margin: 15mm;'
      css += '}'
      const style = document.createElement('style')
      style.type = 'text/css'
      style.media = 'print'
      if (style.styleSheet) {
        style.styleSheet.cssText = css
      } else {
        style.appendChild(document.createTextNode(css))
      }
      head.appendChild(style)
    }
  }, [head, browser])

  const handleLoad = (event) => {
    const iframe = event.target
    if (iframe?.contentDocument) {
      const head = iframe.contentDocument.head
      if (head) {
        let css = '@page {'
        css += 'size: 210mm 297mm; margin: 15mm;'
        css += '}'
        const style = document.createElement('style')
        style.type = 'text/css'
        style.media = 'print'
        if (style.styleSheet) {
          style.styleSheet.cssText = css
        } else {
          style.appendChild(document.createTextNode(css))
        }
        head.appendChild(style)
      }
      setIframeBody(iframe.contentDocument.body)
    }
  }

  if (handleBrowsers.includes(browser) && !isBraveBrowser) {
    return (
      <iframe
        id='arf-print-iframe'
        title={Math.random()}
        width={0}
        height={0}
        frameBorder={0}
        onLoad={handleLoad}
      >
        {iframeBody && ReactDOM.createPortal(children, iframeBody)}
      </iframe>
    )
  }

  return (
    <iframe
      id='arf-print-iframe'
      ref={setRef}
      title={Math.random()}
      width={0}
      height={0}
      frameBorder={0}
    >
      {body && ReactDOM.createPortal(children, body)}
    </iframe>
  )
}

export default IFrame
