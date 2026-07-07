import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
} from '@mui/material';
import type { NavItem } from './sidebarConfig';

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * SidebarNavItem — renders a single sidebar navigation entry.
 *
 * - Active state: highlighted background (primary at 12% opacity) + primary color text.
 * - Collapsed state: icon only, label hidden, tooltip shown on hover.
 * - Uses NavLink for client-side navigation.
 *
 * Requirements: 5.1, 5.2
 */
const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, collapsed, active }) => {
  const theme = useTheme();

  const button = (
    <ListItemButton
      component={NavLink}
      to={item.path}
      sx={{
        borderRadius: 0,
        mx: 0,
        mb: 0,
        minHeight: 44,
        justifyContent: collapsed ? 'center' : 'flex-start',
        px: collapsed ? 1.5 : 2.5,
        borderLeft: active ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
        backgroundColor: active
          ? theme.palette.mode === 'light' ? '#EAEDED' : '#232F3E'
          : 'transparent',
        color: active ? theme.palette.text.primary : theme.palette.text.secondary,
        '&:hover': {
          backgroundColor: active
            ? theme.palette.mode === 'light' ? '#E3E6E6' : '#37475A'
            : theme.palette.action.hover,
        },
        transition: 'background-color 0.15s ease, color 0.15s ease',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 36,
          color: 'inherit',
          justifyContent: 'center',
        }}
      >
        {item.icon}
      </ListItemIcon>

      {!collapsed && (
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: active ? 600 : 400,
            color: 'inherit',
            noWrap: true,
          }}
        />
      )}
    </ListItemButton>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" arrow>
        {/* Tooltip requires a DOM-forwardable child */}
        <span style={{ display: 'block' }}>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

export default SidebarNavItem;
