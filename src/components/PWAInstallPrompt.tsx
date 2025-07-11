import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      // Show prompt after 30 seconds on mobile, 60 seconds on desktop
      setTimeout(() => {
        setShowPrompt(true);
      }, isMobile ? 30000 : 60000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if already running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if not installable, already installed, or recently dismissed
  if (!isInstallable || isInstalled || !showPrompt) {
    return null;
  }

  const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-primary/20 animate-scale-in">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Smartphone className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="gradient-text">Instalar Dindin</CardTitle>
          <CardDescription>
            Instale o Dindin no seu dispositivo para uma experiência mais rápida e completa!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              ✓ Acesso offline
            </div>
            <div className="flex items-center gap-2">
              ✓ Notificações push
            </div>
            <div className="flex items-center gap-2">
              ✓ Melhor performance
            </div>
            <div className="flex items-center gap-2">
              ✓ Ícone na tela inicial
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleInstallClick}
              className="flex-1 gap-2"
              size="lg"
            >
              <Download className="h-4 w-4" />
              Instalar App
            </Button>
            <Button 
              onClick={handleDismiss}
              variant="outline"
              size="lg"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {isMobile && (
            <div className="text-xs text-muted-foreground text-center">
              {navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') 
                ? 'No Safari: toque em "Compartilhar" → "Adicionar à Tela de Início"'
                : 'Toque no menu do navegador e selecione "Adicionar à tela inicial"'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}