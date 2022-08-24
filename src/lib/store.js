import { Store } from 'pullstate'

const GlobalStore = new Store({
  initialValue: [],
  isLeftDrawerVisible: false,
  current: {}
})

export default GlobalStore
