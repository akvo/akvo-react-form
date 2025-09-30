import React from 'react';
import { List, Button } from 'antd';
import { MdRadioButtonChecked, MdCheckCircle } from 'react-icons/md';
import { AiOutlineDown } from 'react-icons/ai';
import GlobalStore from '../lib/store';

const Sidebar = ({
  formsMemo,
  showGroup,
  activeGroup,
  setActiveGroup,
  completeGroup,
  isMobile,
  setIsMobileMenuVisible,
  uiText,
  disabled = false,
}) => {
  console.log(completeGroup);
  return (
    <List
      bordered={false}
      header={
        <div className="arf-sidebar-header">
          {isMobile && (
            <Button
              type="link"
              icon={
                <AiOutlineDown
                  className="arf-icon"
                  onClick={() => isMobile && setIsMobileMenuVisible(false)}
                />
              }
            />
          )}{' '}
          {uiText.formOverview}
        </div>
      }
      dataSource={formsMemo?.question_group?.map((qg, qgi) => ({
        ...qg,
        appear: showGroup.includes(qgi),
      }))}
      renderItem={(item, key) =>
        item.appear && (
          <List.Item
            key={key}
            onClick={() => {
              if (disabled) {
                return;
              }
              isMobile && setIsMobileMenuVisible(false);
              GlobalStore.update((gs) => {
                gs.activeGroup = key;
              });
              setActiveGroup(key);
            }}
            className={`arf-sidebar-list ${
              activeGroup === key ? 'arf-active' : ''
            } ${completeGroup.includes(key) ? 'arf-complete' : ''}`}
          >
            {completeGroup.includes(key) ? (
              <MdCheckCircle className="arf-icon" />
            ) : (
              <MdRadioButtonChecked className="arf-icon" />
            )}
            {item?.label || item?.name || `Section ${key + 1}`}
          </List.Item>
        )
      }
    />
  );
};

export default Sidebar;
