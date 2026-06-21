import { resolvePrefillDefaultValues } from './index';

// Regression coverage for the "Maximum update depth exceeded" loop in
// OptionField / MultipleOptionField. The loop was caused by an empty `pre` ({})
// vacuously satisfying `preItems.length === Object.keys(pre).length` (0 === 0),
// firing form.setFieldsValue on every render. resolvePrefillDefaultValues must
// report `matched: false` for an empty/absent `pre`.

describe('resolvePrefillDefaultValues', () => {
  const allQuestions = [
    { id: 1, name: 'are_you_okay' },
    { id: 2, name: 'mood' },
  ];

  describe('empty / absent pre (the infinite-loop guard)', () => {
    test('empty object pre -> not matched, no values', () => {
      expect(resolvePrefillDefaultValues({}, allQuestions, {})).toEqual({
        matched: false,
        values: [],
      });
    });

    test('absent (no args) pre -> not matched', () => {
      expect(resolvePrefillDefaultValues()).toEqual({
        matched: false,
        values: [],
      });
    });

    test('null pre -> not matched', () => {
      expect(resolvePrefillDefaultValues(null, allQuestions, {})).toEqual({
        matched: false,
        values: [],
      });
    });

    test('empty pre tolerates missing allQuestions / allValues args', () => {
      expect(resolvePrefillDefaultValues({})).toEqual({
        matched: false,
        values: [],
      });
    });
  });

  describe('populated pre', () => {
    test('matches when the source answer resolves a default value', () => {
      const pre = { are_you_okay: { yes: ['happy'] } };
      const allValues = { 1: 'yes' };
      expect(resolvePrefillDefaultValues(pre, allQuestions, allValues)).toEqual(
        {
          matched: true,
          values: ['happy'],
        }
      );
    });

    test('does NOT match when the source answer has no mapped value', () => {
      const pre = { are_you_okay: { yes: ['happy'] } };
      const allValues = { 1: 'no' }; // 'no' not in the pre map
      expect(resolvePrefillDefaultValues(pre, allQuestions, allValues)).toEqual(
        {
          matched: false,
          values: [],
        }
      );
    });

    test('matches only when EVERY pre entry resolves', () => {
      const pre = {
        are_you_okay: { yes: ['happy'] },
        mood: { good: ['calm'] },
      };
      // only the first source answer is present
      const partial = { 1: 'yes' };
      expect(
        resolvePrefillDefaultValues(pre, allQuestions, partial).matched
      ).toBe(false);

      const full = { 1: 'yes', 2: 'good' };
      expect(resolvePrefillDefaultValues(pre, allQuestions, full)).toEqual({
        matched: true,
        values: ['happy', 'calm'],
      });
    });

    test('flattens and de-duplicates resolved values', () => {
      const pre = {
        are_you_okay: { yes: ['happy', 'calm'] },
        mood: { good: ['calm'] },
      };
      const allValues = { 1: 'yes', 2: 'good' };
      const { matched, values } = resolvePrefillDefaultValues(
        pre,
        allQuestions,
        allValues
      );
      expect(matched).toBe(true);
      expect(values).toEqual(['happy', 'calm']);
    });
  });
});
