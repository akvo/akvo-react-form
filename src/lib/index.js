import React from 'react';
import ReactHtmlParser from 'react-html-parser';
import { intersection, orderBy } from 'lodash';
import * as locale from 'locale-codes';

const getDependencyAncestors = (questions, current, dependencies) => {
  const ids = dependencies.map((x) => x.id);
  const ancestors = questions
    .filter((q) => ids.includes(q.id))
    .filter((q) => q?.dependency);
  if (ancestors.length) {
    dependencies = ancestors.map((x) => x.dependency);
    current = [current, ...dependencies].flatMap((x) => x);
    ancestors.forEach((a) => {
      if (a?.dependency) {
        current = getDependencyAncestors(questions, current, a.dependency);
      }
    });
  }
  return current;
};

/**
 * Gets dependency chains for OR logic evaluation
 * Each chain represents a path from the question to a root dependency
 * @param {Array} questions - All questions in the form
 * @param {Array} dependencies - Direct dependencies of the current question
 * @returns {Array} Array of dependency chains, where each chain includes ancestors
 */
const getDependencyChains = (questions, dependencies) => {
  return dependencies.map((dep) => {
    const chain = [dep];
    const question = questions.find((q) => q.id === dep.id);
    if (question?.dependency) {
      // Recursively get ancestor chains and flatten them into this chain
      const ancestorChains = getDependencyChains(
        questions,
        question.dependency
      );
      // For each ancestor chain, we need ALL dependencies to be satisfied (AND logic within a chain)
      // So we flatten all ancestor chains into a single chain
      const allAncestors = ancestorChains.flatMap(
        (ancestorChain) => ancestorChain
      );
      chain.push(...allAncestors);
    }
    return chain;
  });
};

export const transformForm = (forms) => {
  const questions = forms?.question_group
    .map((x) => {
      return x.question;
    })
    .flatMap((x) => x)
    .map((x) => {
      if (x.type === 'option' || x.type === 'multiple_option') {
        const options = x.option.map((o) => ({
          ...o,
          value: o?.value || o?.name,
          label: o?.label || o?.name,
        }));
        return {
          ...x,
          option: orderBy(options, 'order'),
        };
      }
      return x;
    });

  const transformed = questions.map((x) => {
    if (x?.dependency) {
      const dependencyRule = x?.dependency_rule || 'AND';

      // For OR rules, we need to preserve dependency chains to evaluate them correctly
      // For AND rules, we can flatten as before (backward compatibility)
      if (dependencyRule.toUpperCase() === 'OR') {
        return {
          ...x,
          dependency_chains: getDependencyChains(questions, x.dependency),
          dependency_rule: dependencyRule,
        };
      }
      return {
        ...x,
        dependency: getDependencyAncestors(
          questions,
          x.dependency,
          x.dependency
        ),
        dependency_rule: dependencyRule,
      };
    }
    return x;
  });

  const languages = forms?.languages?.map((x) => ({
    label: locale.getByTag(x).name,
    value: x,
  })) || [{ label: 'English', value: 'en' }];

  return {
    ...forms,
    languages: languages,
    question_group: orderBy(forms?.question_group, 'order')?.map((qg) => {
      let repeat = {};
      let repeats = {};
      if (qg?.repeatable) {
        repeat = { repeat: 1 };
        repeats = { repeats: [0] };
      }
      return {
        ...qg,
        ...repeat,
        ...repeats,
        question: orderBy(qg.question, 'order')?.map((q) => {
          return transformed.find((t) => t.id === q.id);
        }),
      };
    }),
  };
};

const translateObject = (obj, name, lang, parse = false) => {
  const html =
    obj?.translations?.find((x) => x.language === lang)?.[name] ||
    obj?.[name] ||
    '';
  if (html.length > 0 && parse) {
    return <div>{ReactHtmlParser(html)}</div>;
  }
  return html;
};

export const translateForm = (forms, lang) => {
  forms = {
    ...forms,
    name: translateObject(forms, 'name', lang),
    description: translateObject(forms, 'description', lang),
    question_group: forms.question_group.map((qg) => ({
      ...qg,
      name: translateObject(qg, 'name', lang),
      label: translateObject(qg, 'label', lang),
      description: translateObject(qg, 'description', lang, true),
      repeatText: translateObject(qg, 'repeatText', lang),
      question: qg.question.map((q) => {
        q = {
          ...q,
          name: translateObject(q, 'name', lang, true),
          label: translateObject(q, 'label', lang),
          tooltip: {
            ...q.tooltip,
            text: translateObject(q.tooltip, 'text', lang, true),
          },
        };
        if (q?.extra?.length) {
          q = {
            ...q,
            extra: q.extra.map((ex) => ({
              ...ex,
              content: translateObject(ex, 'content', lang, true),
            })),
          };
        }
        if (q?.allowOtherText) {
          q = {
            ...q,
            allowOtherText: translateObject(q, 'allowOtherText', lang),
          };
        }
        if (q.type === 'option' || q.type === 'multiple_option') {
          return {
            ...q,
            option: q.option.map((o) => ({
              ...o,
              value: o?.value || o?.name,
              label: o?.label
                ? translateObject(o, 'label', lang)
                : translateObject(o, 'name', lang),
            })),
          };
        }
        return q;
      }),
    })),
  };
  return forms;
};

export const modifyRuleMessage = (r, uiText) => {
  if (!isNaN(r?.max) || !isNaN(r?.min)) {
    if (!isNaN(r?.max) && !isNaN(r?.min)) {
      return {
        ...r,
        message: `${uiText.errorMinMax} ${r.min} - ${r.max}`,
      };
    }
    if (!isNaN(r?.max)) {
      return {
        ...r,
        message: `${uiText.errorMax} ${r.max}`,
      };
    }
    if (!isNaN(r?.min)) {
      return {
        ...r,
        message: `${uiText.errorMin} ${r.min}`,
      };
    }
  }
  return r;
};

export const mapRules = ({ rule, type, required }) => {
  if (type === 'number') {
    return [
      {
        ...rule,
        type: 'number',
      },
    ];
  }
  if (type === 'attachment') {
    return [
      {
        validator: (_, value) => {
          if (
            (value &&
              (typeof value === 'object' || typeof value === 'string')) ||
            !required
          ) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('This is not a valid file'));
        },
      },
    ];
  }
  return [{}];
};

export const validateDependency = (dependency, value) => {
  if (dependency?.options) {
    if (typeof value === 'string') {
      value = [value];
    }
    return intersection(dependency.options, value)?.length > 0;
  }
  let valid = false;
  if (dependency?.min) {
    valid = value >= dependency.min;
  }
  if (dependency?.max) {
    valid = value <= dependency.max;
  }
  if (dependency?.equal) {
    valid = value === dependency.equal;
  }
  if (dependency?.notEqual) {
    valid = value !== dependency.notEqual && !!value;
  }
  return valid;
};

/**
 * Evaluates whether dependencies are satisfied based on dependency_rule
 * @param {Object} question - Question object with dependency/dependency_chains and dependency_rule
 * @param {Object} answers - Current form values/answers (key: questionId, value: answer)
 * @returns {boolean} - True if dependencies are satisfied, false otherwise
 */
export const isDependencySatisfied = (question, answers) => {
  const rule = (question?.dependency_rule || 'AND').toUpperCase();

  // Check for dependency_chains (OR logic with ancestor support)
  if (question?.dependency_chains) {
    // OR logic: at least ONE chain must have ALL its dependencies satisfied
    return question.dependency_chains.some((chain) => {
      // Each chain must have ALL dependencies satisfied (AND within chain)
      return chain.every((dep) => {
        const answer = answers[String(dep.id)];
        return validateDependency(dep, answer);
      });
    });
  }

  // Fallback to flattened dependency array (AND logic or legacy)
  const deps = question?.dependency || [];

  // No dependencies means always satisfied
  if (!deps.length) {
    return true;
  }

  const checkDep = (dep) => {
    const answer = answers[String(dep.id)];
    // Use existing validateDependency function for individual dependency check
    return validateDependency(dep, answer);
  };

  // OR rule: at least one dependency must be satisfied
  // AND rule: all dependencies must be satisfied
  return rule === 'OR' ? deps.some(checkDep) : deps.every(checkDep);
};

export const modifyDependency = ({ question }, { dependency }, repeat) => {
  const questions = question.map((q) => q.id);
  return dependency.map((d) => {
    if (questions.includes(d.id) && repeat) {
      return { ...d, id: `${d.id}-${repeat}` };
    }
    return d;
  });
};

export const todayDate = () => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const date = new Date();
  return `${
    monthNames[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;
};

export const detectMobile = () => {
  /* Use references from https://stackoverflow.com/a/11381730 */
  const toMatch = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
  ];
  const mobileBrowser = toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
  return (
    window.matchMedia('only screen and (max-width: 1064px)').matches ||
    mobileBrowser
  );
};

export const generateDataPointName = (dataPointNameValues) => {
  const dpName = dataPointNameValues
    .filter((d) => d.type !== 'geo' && (d.value || d.value === 0))
    .map((x) => x.value)
    .join(' - ');
  const dpGeo = dataPointNameValues.find((d) => d.type === 'geo')?.value;
  return { dpName, dpGeo };
};

export const filterFormValues = (values, formValue) => {
  const questionsWithType = formValue?.question_group?.flatMap((qg) =>
    qg?.question
      ?.filter((q) => !q?.displayOnly)
      ?.map((q) => ({ id: q.id, type: q.type }))
  );
  const excludeIDs = formValue?.question_group
    ?.flatMap((qg) => qg?.question)
    ?.filter((q) => q?.displayOnly)
    ?.map((q) => `${q?.id}`);
  const resValues = Object.keys(values)
    .filter((k) => !excludeIDs?.includes(k))
    .map((k) => {
      const qtype = questionsWithType.find((q) => q.id === parseInt(k))?.type;
      let val = values[k];
      // check array
      if (val && Array.isArray(val)) {
        const check = val.filter(
          (y) => typeof y !== 'undefined' && (y || isNaN(y))
        );
        val = check.length ? check : null;
      }
      // check object
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        // lat - lng
        if (!val?.lat && !val?.lng && qtype === 'geo') {
          delete val?.lat;
          delete val?.lng;
          val = null;
        }
      }
      return {
        id: k.toString(),
        value: val,
      };
    })
    .filter((x) => !x.id.includes('other-option'))
    .reduce((curr, next) => ({ ...curr, [next.id]: next.value }), {});
  return resValues;
};

export const isHexColorCode = (input) => {
  // Regular expression to match a valid hexadecimal color code
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
  return hexColorRegex.test(input);
};

export const uploadAllAttachments = async (values, formValue) => {
  const allAttachments = formValue?.question_group?.flatMap((qg) =>
    qg?.question?.filter((q) => q?.type === 'attachment')
  );
  const allEndpoints = allAttachments
    ?.map((q) => ({
      id: q.id,
      api: q?.api
        ? q?.api?.query_params
          ? `${q.api.endpoint}${q.api.query_params}`
          : q?.api?.endpoint
        : null,
      file: values?.[`${q.id}`],
      headers: q?.api?.headers || {},
      responseKey: q?.api?.response_key,
    }))
    .filter((q) => q.api && q.file);
  // If no endpoints, return the values as is
  if (!allEndpoints?.length) {
    const updatedValues = { ...values };
    allAttachments?.forEach((attachment) => {
      const file = values?.[`${attachment.id}`];
      updatedValues[attachment.id] = file;
    });
    return updatedValues;
  }
  // Upload all attachments
  const uploadPromises = allEndpoints
    .map((attachment) => {
      if (attachment?.file) {
        return new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append('file', attachment.file);
          fetch(attachment.api, {
            method: 'POST',
            body: formData,
            mode: 'cors',
            cache: 'no-cache',
            headers: {
              Accept: 'application/json',
              ...attachment.headers,
            },
          })
            .then((response) => response.json())
            .then((data) => {
              resolve({
                id: attachment.id,
                data: data?.[attachment.responseKey] || attachment.file,
              });
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
      return null;
    })
    .filter((promise) => promise !== null);
  const results = await Promise.allSettled(uploadPromises);
  const successfulUploads = results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);

  // Replace the values with the successful uploads
  const updatedValues = { ...values };
  successfulUploads.forEach((upload) => {
    updatedValues[upload.id] = upload.data;
  });
  return updatedValues;
};

// Helper functions for repeatable group completion logic
export const groupFilledQuestionsByInstance = (
  filledQuestions,
  questionIds
) => {
  const grouped = {};
  const relevantFilledItems = filledQuestions
    .filter((f) => {
      const questionId = f.id.toString().includes('-')
        ? parseInt(f.id.toString().split('-')[0])
        : parseInt(f.id);
      return questionIds.find((id) => id === questionId);
    })
    .map((f) => f.id);

  for (const filledId of relevantFilledItems) {
    const [questionId, instanceId = 0] = filledId.split('-');
    if (!grouped[instanceId]) {
      grouped[instanceId] = [];
    }
    grouped[instanceId].push(questionId);
  }
  return grouped;
};

export const getSatisfiedDependencies = (
  questionsWithDeps,
  filledQuestions,
  instanceId
) => {
  const res = questionsWithDeps.filter((q) => {
    return (
      q?.dependency?.length ===
      q?.dependency?.filter((dp) => {
        const filledIds = filledQuestions.map((f) => f.id.toString());
        const dependencyValue = filledQuestions.find((f) =>
          parseInt(instanceId, 10) &&
          filledIds.includes(`${dp.id}-${instanceId}`)
            ? `${f.id}` === `${dp.id}-${instanceId}`
            : `${f.id}` === `${dp.id}`
        );
        return validateDependency(dp, dependencyValue?.value);
      }).length
    );
  });
  return res;
};
