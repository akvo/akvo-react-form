import { isDependencySatisfied, validateDependency } from './index';

describe('validateDependency', () => {
  test('should validate option-based dependency with array value', () => {
    const dep = { id: 1, options: ['raw_water_main'] };
    const value = ['raw_water_main', 'reservoir'];
    expect(validateDependency(dep, value)).toBe(true);
  });

  test('should validate option-based dependency with string value', () => {
    const dep = { id: 1, options: ['surface_water_project'] };
    const value = 'surface_water_project';
    expect(validateDependency(dep, value)).toBe(true);
  });

  test('should return false when option does not match', () => {
    const dep = { id: 1, options: ['raw_water_main'] };
    const value = ['dam', 'reservoir'];
    expect(validateDependency(dep, value)).toBe(false);
  });

  test('should validate min dependency', () => {
    const dep = { id: 1, min: 5 };
    expect(validateDependency(dep, 10)).toBe(true);
    expect(validateDependency(dep, 5)).toBe(true);
    expect(validateDependency(dep, 3)).toBe(false);
  });

  test('should validate max dependency', () => {
    const dep = { id: 1, max: 10 };
    expect(validateDependency(dep, 5)).toBe(true);
    expect(validateDependency(dep, 10)).toBe(true);
    expect(validateDependency(dep, 15)).toBe(false);
  });

  test('should validate equal dependency', () => {
    const dep = { id: 1, equal: 'test' };
    expect(validateDependency(dep, 'test')).toBe(true);
    expect(validateDependency(dep, 'other')).toBe(false);
  });

  test('should validate notEqual dependency', () => {
    const dep = { id: 1, notEqual: 'test' };
    expect(validateDependency(dep, 'other')).toBe(true);
    expect(validateDependency(dep, 'test')).toBe(false);
    expect(validateDependency(dep, null)).toBe(false); // null is not valid for notEqual
  });
});

describe('isDependencySatisfied - OR rule', () => {
  const deps = [
    { id: 1749622726348, options: ['raw_water_main'] },
    { id: 1749622726349, options: ['raw_water_main'] },
  ];

  test('should return true when first dependency is satisfied (OR)', () => {
    const question = { dependency_rule: 'OR', dependency: deps };
    const answers = {
      1749622726348: ['raw_water_main'],
      1749622726349: [],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should return true when second dependency is satisfied (OR)', () => {
    const question = { dependency_rule: 'OR', dependency: deps };
    const answers = {
      1749622726348: [],
      1749622726349: ['raw_water_main'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should return true when both dependencies are satisfied (OR)', () => {
    const question = { dependency_rule: 'OR', dependency: deps };
    const answers = {
      1749622726348: ['raw_water_main'],
      1749622726349: ['raw_water_main'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should return false when no dependencies are satisfied (OR)', () => {
    const question = { dependency_rule: 'OR', dependency: deps };
    const answers = {
      1749622726348: [],
      1749622726349: [],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });

  test('should return false when dependencies have different options (OR)', () => {
    const question = { dependency_rule: 'OR', dependency: deps };
    const answers = {
      1749622726348: ['dam'],
      1749622726349: ['reservoir'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });
});

describe('isDependencySatisfied - AND rule', () => {
  const deps = [
    { id: 1723459200018, options: ['raw_water_pipeline'] },
    { id: 1723459210020, options: ['pvc', 'polyethelene'] },
  ];

  test('should return true when all dependencies are satisfied (AND)', () => {
    const question = { dependency_rule: 'AND', dependency: deps };
    const answers = {
      1723459200018: ['raw_water_pipeline'],
      1723459210020: ['pvc'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should return true with multiple matching options (AND)', () => {
    const question = { dependency_rule: 'AND', dependency: deps };
    const answers = {
      1723459200018: ['raw_water_pipeline', 'air_valve'],
      1723459210020: ['polyethelene'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should return false when first dependency is not satisfied (AND)', () => {
    const question = { dependency_rule: 'AND', dependency: deps };
    const answers = {
      1723459200018: [],
      1723459210020: ['pvc'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });

  test('should return false when second dependency is not satisfied (AND)', () => {
    const question = { dependency_rule: 'AND', dependency: deps };
    const answers = {
      1723459200018: ['raw_water_pipeline'],
      1723459210020: [],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });

  test('should return false when no dependencies are satisfied (AND)', () => {
    const question = { dependency_rule: 'AND', dependency: deps };
    const answers = {
      1723459200018: [],
      1723459210020: [],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });
});

describe('isDependencySatisfied - default behavior', () => {
  test('should default to AND when dependency_rule is not specified', () => {
    const deps = [
      { id: 1, options: ['a'] },
      { id: 2, options: ['b'] },
    ];
    const question = { dependency: deps }; // No dependency_rule specified
    const answers = {
      1: ['a'],
      2: ['b'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should default to AND and return false when one dependency fails', () => {
    const deps = [
      { id: 1, options: ['a'] },
      { id: 2, options: ['b'] },
    ];
    const question = { dependency: deps }; // No dependency_rule specified
    const answers = {
      1: ['a'],
      2: [], // Second dependency not satisfied
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });

  test('should return true when no dependencies exist', () => {
    const question = { dependency: [] };
    const answers = {};
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should return true when dependency is undefined', () => {
    const question = {};
    const answers = {};
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });
});

describe('isDependencySatisfied - case insensitive rule', () => {
  test('should handle lowercase "or" as OR', () => {
    const question = {
      dependency_rule: 'or',
      dependency: [
        { id: 1, options: ['a'] },
        { id: 2, options: ['b'] },
      ],
    };
    const answers = {
      1: ['a'],
      2: [],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should handle mixed case "Or" as OR', () => {
    const question = {
      dependency_rule: 'Or',
      dependency: [
        { id: 1, options: ['a'] },
        { id: 2, options: ['b'] },
      ],
    };
    const answers = {
      1: [],
      2: ['b'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });
});

describe('isDependencySatisfied - single dependency', () => {
  test('should work with single dependency using AND (implicit)', () => {
    const question = {
      dependency: [{ id: 1723459200018, options: ['air_valve'] }],
    };
    const answers = {
      1723459200018: ['air_valve'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should work with single dependency using OR', () => {
    const question = {
      dependency_rule: 'OR',
      dependency: [{ id: 1723459200018, options: ['air_valve'] }],
    };
    const answers = {
      1723459200018: ['air_valve'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('should return false when single dependency is not met', () => {
    const question = {
      dependency: [{ id: 1723459200018, options: ['air_valve'] }],
    };
    const answers = {
      1723459200018: ['washout'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });
});

describe('isDependencySatisfied - example-dependency-rule.json scenarios', () => {
  test('raw_water_main_gps_location should be visible when surface water site has raw_water_main', () => {
    const question = {
      id: 1723459200017,
      name: 'raw_water_main_gps_location',
      dependency_rule: 'OR',
      dependency: [
        { id: 1749622726348, options: ['raw_water_main'] },
        { id: 1749622726349, options: ['raw_water_main'] },
      ],
    };
    const answers = {
      1749622726348: ['raw_water_main', 'dam'],
      1749622726349: [],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('raw_water_main_gps_location should be visible when borehole site has raw_water_main', () => {
    const question = {
      id: 1723459200017,
      name: 'raw_water_main_gps_location',
      dependency_rule: 'OR',
      dependency: [
        { id: 1749622726348, options: ['raw_water_main'] },
        { id: 1749622726349, options: ['raw_water_main'] },
      ],
    };
    const answers = {
      1749622726348: [],
      1749622726349: ['raw_water_main', 'reservoir'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('raw_water_main_gps_location should be hidden when neither site has raw_water_main', () => {
    const question = {
      id: 1723459200017,
      name: 'raw_water_main_gps_location',
      dependency_rule: 'OR',
      dependency: [
        { id: 1749622726348, options: ['raw_water_main'] },
        { id: 1749622726349, options: ['raw_water_main'] },
      ],
    };
    const answers = {
      1749622726348: ['dam', 'reservoir'],
      1749622726349: ['borehole', 'pumps'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });

  test('raw_water_main_size should be visible only when both pipeline and type selected (AND)', () => {
    const question = {
      id: 1723459222019,
      name: 'raw_water_main_size',
      // No dependency_rule specified, defaults to AND
      dependency: [
        { id: 1723459200018, options: ['raw_water_pipeline'] },
        { id: 1723459210020, options: ['pvc', 'polyethelene'] },
      ],
    };
    const answers = {
      1723459200018: ['raw_water_pipeline'],
      1723459210020: ['pvc'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });

  test('raw_water_main_size should be hidden when only pipeline is selected', () => {
    const question = {
      id: 1723459222019,
      name: 'raw_water_main_size',
      dependency: [
        { id: 1723459200018, options: ['raw_water_pipeline'] },
        { id: 1723459210020, options: ['pvc', 'polyethelene'] },
      ],
    };
    const answers = {
      1723459200018: ['raw_water_pipeline'],
      1723459210020: [],
    };
    expect(isDependencySatisfied(question, answers)).toBe(false);
  });

  test('air_valve_count should be visible when air_valve is selected (single dependency)', () => {
    const question = {
      id: 1849622785206,
      name: 'air_valve_count',
      dependency: [{ id: 1723459200018, options: ['air_valve'] }],
    };
    const answers = {
      1723459200018: ['air_valve'],
    };
    expect(isDependencySatisfied(question, answers)).toBe(true);
  });
});
