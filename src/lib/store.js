import { Store } from 'pullstate';

const GlobalStore = new Store({
  formConfig: { autoSave: {} },
  initialValue: [],
  isLeftDrawerVisible: false,
  current: {},
});

export default GlobalStore;
