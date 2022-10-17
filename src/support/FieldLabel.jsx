import React from 'react';

const FieldLabel = ({ keyform, content }) => {
  return (
    <div className="arf-field-label">
      <div className="arf-field-label-number">{keyform + 1}.</div>
      {content}
    </div>
  );
};

export default FieldLabel;
