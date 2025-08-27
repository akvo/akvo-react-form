import { Store } from 'pullstate';

const GlobalStore = new Store({
  formConfig: { autoSave: {} },
  initialValue: [],
  isLeftDrawerVisible: false,
  current: {},
  dataPointName: [],
  allQuestions: [],
  activeGroup: 0,
});

export default GlobalStore;
