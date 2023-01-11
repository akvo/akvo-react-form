import React from 'react';

const FieldLabel = ({ keyform, content, coreMandatory }) => {
  const fieldLabelCoreMandatoryClassName = coreMandatory
    ? 'arf-field-label-core-mandatory'
    : '';
  return (
    <div className={`arf-field-label ${fieldLabelCoreMandatoryClassName}`}>
      <div className="arf-field-label-number">{keyform + 1}.</div>
      {content}
    </div>
  );
};

export default FieldLabel;
