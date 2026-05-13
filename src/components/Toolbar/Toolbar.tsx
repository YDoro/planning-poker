import { useTranslation } from 'react-i18next';
import { GamesSVG } from '../SVGs/GamesSVG';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageControl } from '../LanguageControl/LanguageControl';
import { GithubSVG } from '../SVGs/Github';
import { ThemeControl } from '../ThemeControl/ThemeControl';
import { MenuItem } from './MenuItem';
import { Info, List, Menu, Search, SquareArrowRightEnter, SquarePlus } from 'lucide-react'
export const title = 'Planning Poker';

export const Toolbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsDropdownOpen(false); // Close dropdown after navigation
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      icon: <Info />,
      label: t('toolbar.menu.about'),
      onClick: () => handleNavigation('/about-planning-poker'),
    },
    {
      icon: <Search />,
      label: t('toolbar.menu.guide'),
      onClick: () => handleNavigation('/guide'),
    },
    {
      icon: <List />,
      label: t('toolbar.menu.examples'),
      onClick: () => handleNavigation('/examples'),
    },
    {
      icon: <SquarePlus />,
      label: t('toolbar.menu.newSession'),
      onClick: () => handleNavigation('/'),
      testId: 'toolbar.menu.newSession',
      hiddenLabel: true
    },
    {
      icon: <SquareArrowRightEnter />,
      label: t('toolbar.menu.joinSession'),
      onClick: () => handleNavigation('/join'),
      testId: 'toolbar.menu.joinSession',
      hiddenLabel: true
    },
    {
      icon: <GithubSVG />,
      label: 'GitHub',
      onClick: () => (window.location.href = 'https://github.com/ydoro/planning-poker'),
      hiddenLabel: true
    },
  ];
  return (
    <div className='flex w-full justify-center shadow-sm bg-background'>
      <div className='flex w-full items-center p-2 max-w-7xl'>
        <div className='inline-flex items-center'>
          <button className='button-ghost flex items-center' onClick={() => navigate('/')}>
            <div className='pr-1'>
              <GamesSVG />
            </div>
            <p className='md:text-2xl text-sm font-normal'>{title}</p>
          </button>
        </div>

        {/* Right Section */}
        <div className='inline-flex items-center justify-end flex-1'>
          <div className='flex relative' ref={dropdownRef}>
            <ThemeControl />
            <LanguageControl />
            <button
              className='button-ghost flex items-center'
              onClick={toggleDropdown}
              aria-label='Toggle Menu'
            >
              <Menu />
            </button>
            {isDropdownOpen && (
              <div className='absolute right-0 mt-10 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-50 flex flex-col'>
                {menuItems.map((item, index) => (
                  <MenuItem
                    {...item}
                    key={item.label}
                    hiddenLabel={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
