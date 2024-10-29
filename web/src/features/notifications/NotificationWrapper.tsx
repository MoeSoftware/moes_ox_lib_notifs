 // src/features/notifications/NotificationWrapper.tsx

import { useNuiEvent } from '../../hooks/useNuiEvent'; 
import { toast, Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import {
  Box,
  createStyles,
  keyframes,
  RingProgress,
  Stack,
  Text,
  ThemeIcon,
  Group,
} from '@mantine/core';
import React from 'react';
import tinycolor from 'tinycolor2';
import type { NotificationProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import LibIcon from '../../components/LibIcon';

// 1. Define NotificationType to restrict possible values
type NotificationType = 'error' | 'success' | 'info' | 'warning';

// 2. Type guard to check if a value is a valid NotificationType
const isNotificationType = (type: string | undefined): type is NotificationType => {
  return ['error', 'success', 'info', 'warning'].includes(type || '');
};

// 3. Define keyframes for sliding in from the right
const slideInFromRight = keyframes({
  '0%': {
    transform: 'translateX(100%)',
    opacity: 0,
  },
  '100%': {
    transform: 'translateX(0)',
    opacity: 1,
  },
});

// 4. Define styles using Mantine's createStyles
const useStyles = createStyles((theme) => ({
  container: {
    width: 300,
    padding: 16,
    borderRadius: theme.radius.sm,
    fontFamily: 'Roboto',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    backgroundSize: '0% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'left top',
    transition: 'background-size 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
  containerExpanded: {
    backgroundSize: '100% 100%',
  },
  containerShadow: {
    boxShadow: theme.shadows.sm,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    animation: `${slideInFromRight} 0.5s ease-in-out forwards`,
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  title: {
    fontWeight: 500,
    lineHeight: 'normal',
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    flex: 1,
    textShadow: '0 0 5px rgba(255, 255, 255, 0.7)',
    transition: 'opacity 0.5s ease-in-out',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Roboto',
    lineHeight: 'normal',
    position: 'relative',
    zIndex: 2,
    color: '#ffffff',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    transition: 'opacity 0.5s ease-in-out',
  },
  descriptionOnly: {
    fontSize: 14,
    fontFamily: 'Roboto',
    lineHeight: 'normal',
    position: 'relative',
    zIndex: 2,
    color: '#ffffff',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    transition: 'opacity 0.5s ease-in-out',
  },
  contentWrapper: {
    position: 'relative',
    flex: 1,
    zIndex: 2,
    opacity: 0, // Start hidden and transition with contentVisible
    transition: 'opacity 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
  },
  contentVisible: {
    opacity: 1,
  },
  ringProgress: {
    transition: 'opacity 0.3s ease-in-out',
    opacity: 0,
  },
  ringProgressVisible: {
    opacity: 1,
  },
}));


// 5. Function to create animation keyframes
const createAnimation = (from: string, to: string, visible: boolean) =>
  keyframes({
    from: {
      opacity: visible ? 0 : 1,
      transform: `translate${from}`,
    },
    to: {
      opacity: visible ? 1 : 0,
      transform: `translate${to}`,
    },
  });

// 6. Function to get animation string based on visibility and position
const getAnimation = (visible: boolean, position: string) => {
  const animationOptions = visible ? '0.2s ease-out forwards' : '0.4s ease-in forwards';
  let animation: { from: string; to: string };

  if (visible) {
    animation = position.includes('bottom')
      ? { from: 'Y(30px)', to: 'Y(0px)' }
      : { from: 'Y(-30px)', to: 'Y(0px)' };
  } else {
    if (position.includes('right')) {
      animation = { from: 'X(0px)', to: 'X(100%)' };
    } else if (position.includes('left')) {
      animation = { from: 'X(0px)', to: 'X(-100%)' };
    } else if (position === 'top-center') {
      animation = { from: 'Y(0px)', to: 'Y(-100%)' };
    } else if (position === 'bottom-center') {
      animation = { from: 'Y(0px)', to: 'Y(100%)' };
    } else {
      animation = { from: 'X(0px)', to: 'X(100%)' };
    }
  }

  return `${createAnimation(animation.from, animation.to, visible)} ${animationOptions}`;
};

// 7. Helper function to determine if the icon is a custom image URL
const isImageURL = (icon: any): icon is string => {
  return (
    typeof icon === 'string' &&
    (icon.startsWith('http') || icon.startsWith('/'))
  );
};

// 8. NotificationContent component
const NotificationContent: React.FC<{
  t: any;
  data: NotificationProps;
  iconColor: string;
  duration: number;
  toastKey: number;
  position: string;
}> = ({ t, data, iconColor, duration, toastKey, position }) => {
  const { classes, cx } = useStyles();
  const [progressValue, setProgressValue] = React.useState(100);
  const [backgroundExpanded, setBackgroundExpanded] = React.useState(false);
  const [boxShadowVisible, setBoxShadowVisible] = React.useState(false);
  const [contentVisible, setContentVisible] = React.useState(false);

  // Define gradients and titleColors based on notification type
  const gradients: Record<NotificationType, string> = {
    error: `linear-gradient(to top right, rgba(240, 62, 62, 0.6), rgba(0,0,0,0.6))`,
    success: `linear-gradient(to top right, rgba(18, 184, 134, 0.6), rgba(0,0,0,0.6))`,
    info: `linear-gradient(to top right, rgba(156, 39, 176, 0.6), rgba(0,0,0,0.6))`,
    warning: `linear-gradient(to top right, rgba(250, 176, 5, 0.6), rgba(0,0,0,0.6))`,
  };

  const titleColors: Record<NotificationType, string> = {
    error: '#f03e3e',
    success: '#12b886',
    info: '#9c27b0',
    warning: '#fab005',
  };

  // 9. Start the background and content animations after the icon slides in
  React.useEffect(() => {
    const backgroundDelay = 500; // Delay before background animation starts
    const backgroundExpansionDuration = 300; // Duration of background expansion (from CSS transition)
    const contentDelay = 800;    // Delay before content appears

    const timer1 = setTimeout(() => {
      setBackgroundExpanded(true);
    }, backgroundDelay);

    // Set boxShadowVisible after the background has fully expanded
    const boxShadowDelay = backgroundDelay + backgroundExpansionDuration;
    const timer2 = setTimeout(() => setBoxShadowVisible(true), boxShadowDelay);

    const timer3 = setTimeout(() => {
      setContentVisible(true);
    }, contentDelay);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Timer effect for the RingProgress
  React.useEffect(() => {
    let start = 100;
    const interval = duration / 100; // Calculate interval to decrement progress smoothly

    const timer = setInterval(() => {
      start -= 1;
      setProgressValue(start);
      if (start <= 0) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <Box
      sx={{
        animation: getAnimation(t.visible, position),
        backgroundImage: backgroundExpanded ? gradients[data.type as NotificationType] : 'none',
        ...data.style,
      }}
      className={cx(classes.container, {
        [classes.containerExpanded]: backgroundExpanded,
        [classes.containerShadow]: boxShadowVisible,
      })}
    >
      {/* Header: Icon on Left and Timer on Right */}
      <Box className={classes.header}>
        {/* Left: Icon */}
        <Box className={classes.iconWrapper}>
          {data.icon && (
            <>
              {isImageURL(data.icon) ? (
                <ThemeIcon
                  radius="xl"
                  size={32}
                  variant="default"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <img
                    src={data.icon}
                    alt="Custom Icon"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                    }}
                  />
                </ThemeIcon>
              ) : (
                <ThemeIcon
                  color={iconColor}
                  radius="xl"
                  size={32}
                  variant={
                    tinycolor(iconColor).getAlpha() < 1 ? undefined : 'light'
                  }
                >
                  <LibIcon
                    icon={data.icon!}
                    fixedWidth
                    color={iconColor}
                    animation={data.iconAnimation}
                  />
                </ThemeIcon>
              )}
            </>
          )}
        </Box>

        {/* Center: Title */}
        {data.title && (
          <Text
            className={classes.title}
            style={{
              color: titleColors[data.type as NotificationType],
              textShadow: `0 0 5px ${titleColors[data.type as NotificationType]}`,
              opacity: contentVisible ? 1 : 0,
            }}
          >
            {data.title}
          </Text>
        )}

        {/* Right: RingProgress Timer */}
        {data.showDuration && (
          <RingProgress
            key={toastKey}
            size={24} // Smaller size
            thickness={2}
            sections={[{ value: progressValue, color: iconColor }]}
            styles={{
              root: {
                transition: 'opacity 0.3s ease-in-out',
                opacity: contentVisible ? 1 : 0,
              },
            }}
            className={cx(classes.ringProgress, {
              [classes.ringProgressVisible]: contentVisible,
            })}
            label={null} // Remove default label
          />
        )}
      </Box>

      {/* Content Wrapper: Description */}
      <Box
        className={cx(classes.contentWrapper, {
          [classes.contentVisible]: contentVisible,
        })}
      >
        {data.description && (
          <Box style={{ opacity: contentVisible ? 1 : 0}}>
            <ReactMarkdown
              components={MarkdownComponents}
              className={`${!data.title ? classes.descriptionOnly : classes.description}`}
            >
              {data.description}
            </ReactMarkdown>
          </Box>
        )}
      </Box>

    </Box>
  );
};

// 10. Main Notifications component
const Notifications: React.FC = () => {
  const [toastKey, setToastKey] = React.useState(0);

  useNuiEvent<NotificationProps>('notify', (data) => {
    if (!data.title && !data.description) return;

    const toastId = data.id?.toString();
    const duration = data.duration || 3000;

    let iconColor: string;
    let position = data.position || 'top-right';

    data.showDuration = data.showDuration !== undefined ? data.showDuration : true;

    if (toastId) setToastKey((prevKey) => prevKey + 1);

    // Backwards compatibility with old notifications
    switch (position) {
      case 'top':
        position = 'top-center';
        break;
      case 'bottom':
        position = 'bottom-center';
        break;
    }

    if (!data.icon) {
      switch (data.type) {
        case 'error':
          data.icon = 'circle-xmark';
          break;
        case 'success':
          data.icon = 'circle-check';
          break;
        case 'warning':
          data.icon = 'circle-exclamation';
          break;
        default:
          data.icon = 'circle-info';
          break;
      }
    }

    if (!data.iconColor) {
      switch (data.type) {
        case 'error':
          iconColor = '#f03e3e';
          break;
        case 'success':
          iconColor = '#12b886';
          break;
        case 'warning':
          iconColor = '#fab005';
          break;
        default:
          iconColor = '#9c27b0'; // Purple for 'info'
          break;
      }
    } else {
      iconColor = tinycolor(data.iconColor).toRgbString();
    }

    toast.custom(
      (t) => (
        <NotificationContent
          t={t}
          data={data}
          iconColor={iconColor}
          duration={duration}
          toastKey={toastKey}
          position={position}
        />
      ),
      {
        id: toastId,
        duration: duration,
        position: position,
      }
    );
  });

  return <Toaster />;
};

export default Notifications;
