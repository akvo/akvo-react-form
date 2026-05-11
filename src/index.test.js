import { Webform, dataStore, SavedSubmission, DownloadAnswerAsExcel } from '.';

describe('Library exports', () => {
  it('Webform is truthy', () => {
    expect(Webform).toBeTruthy();
  });

  it('dataStore is truthy', () => {
    expect(dataStore).toBeTruthy();
  });

  it('SavedSubmission is truthy', () => {
    expect(SavedSubmission).toBeTruthy();
  });

  it('DownloadAnswerAsExcel is truthy', () => {
    expect(DownloadAnswerAsExcel).toBeTruthy();
  });
});
