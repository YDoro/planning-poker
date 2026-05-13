import React from 'react';

export const MenuItem = ({
  icon,
  label,
  onClick,
  testId,
  hiddenLabel
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  testId?: string;
  hiddenLabel?: boolean;
}) => {
  return (
    <button
      className='button-ghost text-left flex items-center'
      onClick={onClick}
      data-testid={testId}
    >
      <div>{icon}</div>
      {!hiddenLabel && <div className='pl-2 text-sm font-normal'> {label}</div>}
    </button>
  );
};
