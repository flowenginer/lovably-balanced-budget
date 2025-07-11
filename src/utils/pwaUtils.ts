// PWA utilities for better user experience

declare global {
  interface Navigator {
    standalone?: boolean;
  }
  interface Window {
    MSStream?: any;
  }
}

export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const canInstallPWA = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const showInstallInstructions = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('safari') && userAgent.includes('iphone')) {
    return 'Toque no ícone de compartilhar no Safari e selecione "Adicionar à Tela de Início"';
  } else if (userAgent.includes('chrome') && userAgent.includes('android')) {
    return 'Toque no menu do Chrome (⋮) e selecione "Adicionar à tela inicial"';
  } else if (userAgent.includes('firefox')) {
    return 'Toque no menu do Firefox e selecione "Instalar app"';
  }
  
  return 'Procure pela opção "Adicionar à tela inicial" ou "Instalar app" no menu do seu navegador';
};