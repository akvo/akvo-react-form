import { Store } from 'pullstate'

const GlobalStore = new Store({
  initialValue: [],
  isLeftDrawerVisible: false
})

export default GlobalStore
