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
}) => {
  switch (field.type) {
    case 'option':
      return (
        <TypeOption
          keyform={index}
          rules={rules}
          uiText={uiText}
          allOptionDropdown={allOptionDropdown}
          {...field}
        />
      );
    case 'multiple_option':
      return (
        <TypeMultipleOption
          keyform={index}
          rules={rules}
          uiText={uiText}
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
          {...field}
        />
      );
    case 'date':
      return (
        <TypeDate
          keyform={index}
          rules={rules}
          uiText={uiText}
          {...field}
        />
      );
    case 'number':
      return (
        <TypeNumber
          keyform={index}
          rules={rules}
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
          {...field}
        />
      );
    case 'text':
      return (
        <TypeText
          keyform={index}
          rules={rules}
          uiText={uiText}
          {...field}
        />
      );
    case 'autofield':
      return (
        <TypeAutoField
          keyform={index}
          rules={rules}
          uiText={uiText}
          {...field}
        />
      );
    case 'table':
      return (
        <TypeTable
          keyform={index}
          rules={rules}
          uiText={uiText}
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
          {...field}
        />
      );
    default:
      return (
        <TypeInput
          keyform={index}
          rules={rules}
          uiText={uiText}
          {...field}
        />
      );
  }
};

export default QuestionFields;
