import { NotificationProps } from '../../../typings';
import { debugData } from '../../../utils/debugData';

export const debugCustomNotification = () => {
  debugData<NotificationProps>([
    {
      action: 'notify',
      data: {
        title: 'Success',
        description: 'Notification description',
        type: 'success',
        id: 'pogchamp',
        duration: 20000,
        style: {
          '.description': {
            color: 'red',
          },
        },
      },
    },
  ]);
  debugData<NotificationProps>([
    {
      action: 'notify',
      data: {
        title: 'Error',
        description: 'Notification descriptionNotification descriptionNotification descriptionNotification descriptionNotification descriptionNotification descriptionNotification description',
        type: 'error',
      },
    },
  ]);
  debugData<NotificationProps>([
    {
      action: 'notify',
      data: {
        title: 'Warning',
        description: 'Lorem Epsum something something roman whatever the thing is haha',
        type: 'warning',
      },
    },
  ]);
  debugData<NotificationProps>([
    {
      action: 'notify',
      data: {
        title: 'Info',
        description: 'Notification description Notification description Notification description Notification description Notification description Notification description Notification description',
        type: 'info',
      },
    },
  ]);
  debugData<NotificationProps>([
    {
      action: 'notify',
      data: {
        title: 'Custom icon success',
        description: 'Notification description',
        type: 'success',
        icon: 'microchip',
        showDuration: false,
      },
    },
  ]);
};
