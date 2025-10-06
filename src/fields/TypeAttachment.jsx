import React, { useEffect, useState, useMemo } from 'react';
import { Button, Form, Modal, Space, Upload } from 'antd';
import { MdUpload } from 'react-icons/md';
import { FieldLabel, RepeatTableView } from '../support';
import MIME_TYPES from '../lib/mime_types';
import {
  validateDisableDependencyQuestionInRepeatQuestionLevel,
  checkHideFieldsForRepeatInQuestionLevel,
} from '../lib';

const AttachmentField = ({
  id,
  required,
  tooltip,
  rules,
  rule,
  uiText,
  show_repeat_in_question_level,
  dependency,
  repeat,
  fileList,
  setFileList,
  disabled = false,
}) => {
  const form = Form.useFormInstance();
  const { allowedFileTypes } = rule || {};

  // handle the dependency for show_repeat_in_question_level
  const disableFieldByDependency =
    validateDisableDependencyQuestionInRepeatQuestionLevel({
      formRef: form,
      show_repeat_in_question_level,
      dependency,
      repeat,
    });

  const handleRemove = (file) => {
    const index = fileList.indexOf(file);
    const newFileList = [...fileList];
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const handleBeforeUpload = (file) => {
    const fileType = file.type;
    const allowedMimeTypes = allowedFileTypes?.length
      ? allowedFileTypes.map((type) => MIME_TYPES?.[type] || type)
      : [];
    const isAllowed = allowedMimeTypes.length
      ? allowedMimeTypes.includes(fileType)
      : true;
    if (!isAllowed) {
      const errorMessage = `${uiText.errorFileType} ${allowedFileTypes.join(
        ', '
      )}`;
      Modal.error({
        title: uiText.errorFileTypeTitle,
        content: errorMessage,
        onOk: () => {
          setFileList([]);
        },
      });
      return false;
    }
    setFileList([file]);
    return false;
  };

  return (
    <Form.Item
      name={disableFieldByDependency ? null : id}
      rules={rules}
      tooltip={tooltip?.text}
      required={!disabled ? required : false}
      className="arf-field-attachment"
      getValueFromEvent={(file) => {
        if (file?.fileList?.length) {
          return file.fileList[0].originFileObj;
        }
        return null;
      }}
    >
      <Upload
        onRemove={handleRemove}
        beforeUpload={handleBeforeUpload}
        maxCount={1}
        fileList={fileList.filter((f) => f instanceof File)}
        disabled={disabled || disableFieldByDependency}
      >
        <Button>
          <Space>
            <span>
              <MdUpload />
            </span>
            <span>{uiText.uploadFile}</span>
          </Space>
        </Button>
      </Upload>
    </Form.Item>
  );
};

const TypeAttachment = ({
  id,
  name,
  label,
  keyform,
  required,
  tooltip,
  requiredSign,
  rule,
  rules,
  uiText,
  show_repeat_in_question_level,
  repeats,
  dependency,
  initialValue = null,
  disabled = false,
}) => {
  const [fileList, setFileList] = useState([initialValue].filter(Boolean));
  const [firstLoad, setFirstLoad] = useState(true);
  const form = Form.useFormInstance();

  useEffect(() => {
    // create a file object from the initialValue if it is a string
    if (
      typeof initialValue === 'string' &&
      fileList.filter((f) => f instanceof File).length === 0 &&
      firstLoad
    ) {
      setFirstLoad(false);
      // set the form value from the initialValue
      form.setFieldsValue({
        [id]: initialValue,
      });
      // download the file and create a file object using fetch js
      fetch(initialValue)
        .then((response) => response.blob())
        .then((blob) => {
          const fname = initialValue.split('/').pop();
          // remove the query string from the file name
          const fileName = fname.split('?')[0];
          const fileExtension = fileName.split('.').pop();
          const file = new File([blob], fileName, {
            type: MIME_TYPES?.[fileExtension] || 'application/octet-stream',
          });
          // set the fileList state with the file object
          setFileList([file]);
        })
        .catch((error) => {
          console.error('Error fetching file:', error);
        });
    }
  }, [initialValue, fileList, form, firstLoad, id]);

  // handle to show/hide fields based on dependency of repeat inside question level
  const hideFields = checkHideFieldsForRepeatInQuestionLevel({
    formRef: form,
    show_repeat_in_question_level,
    dependency,
    repeats,
  });
  // eol show/hide fields

  // generate table view of repeat group question
  const repeatInputs = useMemo(() => {
    if (!repeats || !show_repeat_in_question_level || hideFields) {
      return [];
    }
    return repeats.map((r) => {
      return {
        label: r,
        field: (
          <AttachmentField
            id={`${id}-${r}`}
            required={required}
            tooltip={tooltip}
            rules={rules}
            rule={rule}
            uiText={uiText}
            show_repeat_in_question_level={show_repeat_in_question_level}
            dependency={dependency}
            repeat={r}
            fileList={fileList}
            setFileList={setFileList}
            disabled={disabled}
          />
        ),
      };
    });
  }, [
    hideFields,
    id,
    required,
    rules,
    repeats,
    show_repeat_in_question_level,
    dependency,
    disabled,
    rule,
    tooltip,
    uiText,
    fileList,
  ]);

  return (
    <Form.Item
      className="arf-field"
      label={
        <FieldLabel
          keyform={keyform}
          content={label || name || uiText.uploadFile}
          requiredSign={required ? requiredSign : null}
        />
      }
      tooltip={tooltip?.text}
      required={!disabled ? required : false}
    >
      {/* Show as repeat inputs or not */}
      {show_repeat_in_question_level ? (
        <RepeatTableView
          id={id}
          dataSource={repeatInputs}
        />
      ) : (
        <AttachmentField
          id={id}
          required={required}
          tooltip={tooltip}
          rules={rules}
          rule={rule}
          uiText={uiText}
          show_repeat_in_question_level={show_repeat_in_question_level}
          fileList={fileList}
          setFileList={setFileList}
          disabled={disabled}
        />
      )}
    </Form.Item>
  );
};

export default TypeAttachment;
