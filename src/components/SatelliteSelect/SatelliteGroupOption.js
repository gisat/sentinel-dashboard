import React from 'react';// import { jsx } from '@emotion/core';

const SatelliteGroupOption = (props) => {
  const {
    children,
    className,
    cx,
    getStyles,
    Heading,
    headingProps,
    label,
    theme,
    selectProps,
    data
  } = props;
  return (
    <div style={getStyles('group', props)} className={cx({ group: true }, className)} >
      <Heading
        {...headingProps}
        selectProps={selectProps}
        theme={theme}
        getStyles={getStyles}
        cx={cx}
        groupData={data.groupData}
      >
        {label}
      </Heading>
      <div>
        {children}
      </div>
    </div>
  );
};

export const GroupHeading = (props) => {
  const { className, cx, getStyles, theme, selectProps, ...cleanProps } = props;
  return (
    <div
      css={getStyles('groupHeading', { theme, ...cleanProps })}
      className={cx({ 'group-heading': true }, className)}
      {...cleanProps}
    />
  );
};

export default SatelliteGroupOption;