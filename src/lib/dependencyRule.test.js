import {
  isDependencySatisfied,
  validateDependency,
  transformForm,
} from './index';

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

describe('transformForm - OR rule transformation', () => {
  test('should keep original dependency (not flattened) for OR rules', () => {
    const formData = {
      question_group: [
        {
          question: [
            {
              id: 1,
              name: 'parent',
              type: 'option',
              option: [
                { name: 'option_a', value: 'option_a' },
                { name: 'option_b', value: 'option_b' },
              ],
            },
            {
              id: 2,
              name: 'child',
              type: 'text',
              dependency: [{ id: 1, options: ['option_a'] }],
              dependency_rule: 'OR',
            },
          ],
        },
      ],
    };

    const transformed = transformForm(formData);
    const childQuestion = transformed.question_group[0].question.find(
      (q) => q.id === 2
    );

    // Should KEEP original dependency property (not flattened)
    expect(childQuestion.dependency).toBeDefined();
    expect(Array.isArray(childQuestion.dependency)).toBe(true);
    expect(childQuestion.dependency.length).toBe(1);
    expect(childQuestion.dependency[0]).toEqual({ id: 1, options: ['option_a'] });

    // Should NOT have dependency_chains (we use recursive evaluation instead)
    expect(childQuestion.dependency_chains).toBeUndefined();

    // Should have dependency_rule set
    expect(childQuestion.dependency_rule).toBe('OR');
  });

  test('should preserve dependency property and flatten for AND rules', () => {
    const formData = {
      question_group: [
        {
          question: [
            {
              id: 1,
              name: 'parent',
              type: 'option',
              option: [
                { name: 'option_a', value: 'option_a' },
                { name: 'option_b', value: 'option_b' },
              ],
            },
            {
              id: 2,
              name: 'child',
              type: 'text',
              dependency: [{ id: 1, options: ['option_a'] }],
              dependency_rule: 'AND',
            },
          ],
        },
      ],
    };

    const transformed = transformForm(formData);
    const childQuestion = transformed.question_group[0].question.find(
      (q) => q.id === 2
    );

    // Should have dependency property (flattened)
    expect(childQuestion.dependency).toBeDefined();
    expect(Array.isArray(childQuestion.dependency)).toBe(true);

    // Should NOT have dependency_chains property
    expect(childQuestion.dependency_chains).toBeUndefined();
  });

  test('should work with multiple OR dependencies', () => {
    const formData = {
      question_group: [
        {
          question: [
            { id: 1, name: 'q1', type: 'option', option: [] },
            { id: 2, name: 'q2', type: 'option', option: [] },
            {
              id: 3,
              name: 'child',
              type: 'text',
              dependency: [
                { id: 1, options: ['a'] },
                { id: 2, options: ['b'] },
              ],
              dependency_rule: 'OR',
            },
          ],
        },
      ],
    };

    const transformed = transformForm(formData);
    const childQuestion = transformed.question_group[0].question.find(
      (q) => q.id === 3
    );

    // Should keep original dependency (not flattened)
    expect(childQuestion.dependency).toBeDefined();
    expect(childQuestion.dependency.length).toBe(2);
    // Should NOT create dependency_chains
    expect(childQuestion.dependency_chains).toBeUndefined();
  });
});

describe('isDependencySatisfied - OR rule with ancestor dependencies (recursive)', () => {
  test('should show raw_water_main question only when borehole selected AND raw_water_main selected', () => {
    // This simulates the bug scenario:
    // - Question 1749621851234 (type_of_project) - parent
    // - Question 1749622726349 (accessible_borehole_construction_site) depends on 1749621851234
    // - Question 1723459200017 (raw_water_main_gps_location) depends on 1749622726349 OR others

    // All questions (for ancestor lookups)
    const allQuestions = [
      {
        id: 1749621851234,
        name: 'type_of_project',
        type: 'option',
        // No dependencies
      },
      {
        id: 1749622726348,
        name: 'accessible_surface_water_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['surface_water_project'] }],
      },
      {
        id: 1749622726349,
        name: 'accessible_borehole_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['borehole'] }],
      },
      {
        id: 1749622726350,
        name: 'accessible_desalination_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['desalination'] }],
      },
    ];

    const question = {
      id: 1723459200017,
      name: 'raw_water_main_gps_location',
      dependency_rule: 'OR',
      dependency: [
        { id: 1749622726348, options: ['raw_water_main'] },
        { id: 1749622726349, options: ['raw_water_main'] },
        { id: 1749622726350, options: ['raw_water_main'] },
      ],
    };

    // User selected "borehole" but NOT "raw_water_main" yet
    const answers = {
      1749621851234: 'borehole',
      1749622726349: [], // No construction site selected yet
    };

    // Should be FALSE because none of the OR dependencies are satisfied:
    // - 1749622726348 not satisfied (no raw_water_main)
    // - 1749622726349 not satisfied (no raw_water_main)
    // - 1749622726350 not satisfied (no raw_water_main)
    expect(isDependencySatisfied(question, answers, allQuestions)).toBe(false);
  });

  test('should show raw_water_main question when borehole selected AND raw_water_main selected', () => {
    const allQuestions = [
      {
        id: 1749621851234,
        name: 'type_of_project',
        type: 'option',
      },
      {
        id: 1749622726348,
        name: 'accessible_surface_water_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['surface_water_project'] }],
      },
      {
        id: 1749622726349,
        name: 'accessible_borehole_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['borehole'] }],
      },
      {
        id: 1749622726350,
        name: 'accessible_desalination_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['desalination'] }],
      },
    ];

    const question = {
      id: 1723459200017,
      name: 'raw_water_main_gps_location',
      dependency_rule: 'OR',
      dependency: [
        { id: 1749622726348, options: ['raw_water_main'] },
        { id: 1749622726349, options: ['raw_water_main'] },
        { id: 1749622726350, options: ['raw_water_main'] },
      ],
    };

    // User selected "borehole" AND "raw_water_main"
    const answers = {
      1749621851234: 'borehole',
      1749622726349: ['raw_water_main', 'reservoir'],
    };

    // Should be TRUE because one dependency (with ancestors) is fully satisfied
    expect(isDependencySatisfied(question, answers, allQuestions)).toBe(true);
  });

  test('should NOT show when wrong project type selected even if raw_water_main selected', () => {
    const allQuestions = [
      {
        id: 1749621851234,
        name: 'type_of_project',
        type: 'option',
      },
      {
        id: 1749622726348,
        name: 'accessible_surface_water_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['surface_water_project'] }],
      },
      {
        id: 1749622726349,
        name: 'accessible_borehole_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['borehole'] }],
      },
    ];

    const question = {
      id: 1723459200017,
      name: 'raw_water_main_gps_location',
      dependency_rule: 'OR',
      dependency: [
        { id: 1749622726348, options: ['raw_water_main'] },
        { id: 1749622726349, options: ['raw_water_main'] },
      ],
    };

    // User selected "desalination" and raw_water_main on borehole question
    const answers = {
      1749621851234: 'desalination',
      1749622726349: ['raw_water_main'],
    };

    // Should be FALSE because ancestors don't match
    expect(isDependencySatisfied(question, answers, allQuestions)).toBe(false);
  });

  test('should show when surface water project selected AND raw_water_main selected', () => {
    const allQuestions = [
      {
        id: 1749621851234,
        name: 'type_of_project',
        type: 'option',
      },
      {
        id: 1749622726348,
        name: 'accessible_surface_water_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['surface_water_project'] }],
      },
      {
        id: 1749622726349,
        name: 'accessible_borehole_construction_site',
        type: 'multiple_option',
        dependency: [{ id: 1749621851234, options: ['borehole'] }],
      },
    ];

    const question = {
      id: 1723459200017,
      name: 'raw_water_main_gps_location',
      dependency_rule: 'OR',
      dependency: [
        { id: 1749622726348, options: ['raw_water_main'] },
        { id: 1749622726349, options: ['raw_water_main'] },
      ],
    };

    // User selected "surface_water_project" AND "raw_water_main"
    const answers = {
      1749621851234: 'surface_water_project',
      1749622726348: ['raw_water_main', 'dam'],
    };

    // Should be TRUE because chain 1 is fully satisfied
    expect(isDependencySatisfied(question, answers, allQuestions)).toBe(true);
  });

  test('should work with multiple levels of ancestors (3+ levels deep)', () => {
    const allQuestions = [
      {
        id: 1,
        name: 'grandparent',
        type: 'option',
      },
      {
        id: 2,
        name: 'parent',
        type: 'option',
        dependency: [{ id: 1, options: ['option_a'] }],
      },
      {
        id: 3,
        name: 'direct_dep',
        type: 'option',
        dependency: [{ id: 2, options: ['option_b'] }],
      },
    ];

    const question = {
      id: 999,
      name: 'deeply_nested_question',
      dependency_rule: 'OR',
      dependency: [{ id: 3, options: ['option_c'] }],
    };

    // All ancestors satisfied
    const answersAllSatisfied = {
      1: 'option_a',
      2: ['option_b'],
      3: ['option_c'],
    };
    expect(isDependencySatisfied(question, answersAllSatisfied, allQuestions)).toBe(true);

    // Only top-level satisfied (should fail)
    const answersTopOnly = {
      1: 'option_a',
      2: [],
      3: [],
    };
    expect(isDependencySatisfied(question, answersTopOnly, allQuestions)).toBe(false);

    // Only direct dependency satisfied (should fail)
    const answersDirectOnly = {
      1: null,
      2: [],
      3: ['option_c'],
    };
    expect(isDependencySatisfied(question, answersDirectOnly, allQuestions)).toBe(false);
  });
});
