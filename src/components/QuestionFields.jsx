import React from 'react';
import {
  TypeOption,
  TypeMultipleOption,
  TypeDate,
  TypeCascade,
  TypeNumber,
  TypeInput,
  TypeText,
  TypeTree,
  TypeGeo,
  TypeAutoField,
  TypeTable,
  TypeImage,
  TypeEntity,
  TypeAttachment,
  TypeSignature,
} from '../fields';

const QuestionFields = ({
  group,
  rules,
  cascade,
  tree,
  index,
  field,
  initialValue,
  uiText,
  allOptionDropdown,
  allQuestions,
}) => {
  switch (field.type) {
    case 'option':
      return (
        <TypeOption
          keyform={index}
          rules={rules}
          uiText={uiText}
          allOptionDropdown={allOptionDropdown}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'multiple_option':
      return (
        <TypeMultipleOption
          keyform={index}
          rules={rules}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'cascade':
      if (field?.extra?.type === 'entity' && field?.extra?.parentId) {
        const { extra, ...props } = field;
        return (
          <TypeEntity
            keyform={index}
            rules={rules}
            uiText={uiText}
            parentId={extra.parentId}
            group={group}
            allQuestions={allQuestions}
            {...props}
          />
        );
      }
      return (
        <TypeCascade
          keyform={index}
          cascade={cascade?.[field?.option]}
          rules={rules}
          initialValue={initialValue}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'tree':
      return (
        <TypeTree
          keyform={index}
          tree={tree?.[field?.option]}
          rules={rules}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'date':
      return (
        <TypeDate
          keyform={index}
          rules={rules}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'number':
      return (
        <TypeNumber
          keyform={index}
          rules={rules}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'geo':
      return (
        <TypeGeo
          keyform={index}
          rules={rules}
          initialValue={initialValue}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'text':
      return (
        <TypeText
          keyform={index}
          rules={rules}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'autofield':
      return (
        <TypeAutoField
          keyform={index}
          rules={rules}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'table':
      return (
        <TypeTable
          keyform={index}
          rules={rules}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'photo':
    case 'image':
      return (
        <TypeImage
          keyform={index}
          rules={rules}
          initialValue={initialValue}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'attachment':
      return (
        <TypeAttachment
          keyform={index}
          rules={rules}
          initialValue={initialValue}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    case 'signature':
      return (
        <TypeSignature
          keyform={index}
          rules={rules}
          initialValue={initialValue}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
    default:
      return (
        <TypeInput
          keyform={index}
          rules={rules}
          uiText={uiText}
          group={group}
          allQuestions={allQuestions}
          {...field}
        />
      );
  }
};

export default QuestionFields;
