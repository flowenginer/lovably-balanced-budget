import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone, Share, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 3 seconds on mobile, don't auto-show on desktop
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    // Only for non-iOS devices (Android, desktop)
    if (!isIOS) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    // Para iOS, mostra prompt personalizado após 3 segundos
    if (isIOS && !isInStandaloneMode) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => {
      if (!isIOS) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      }
    };
  }, [isIOS, isInStandaloneMode]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 24 hours
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if recently dismissed
  const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null;
  }

  // Don't show if already installed or prompt not ready
  if (isInStandaloneMode || !showPrompt) {
    return null;
  }

  // Renderiza prompt para iOS
  if (isIOS && showPrompt && !isInStandaloneMode) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-xl bg-card border-border mx-auto max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Instalar Dindin</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPrompt(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <CardDescription className="text-sm">
            Adicione à tela inicial para uma experiência melhor
          </CardDescription>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Share className="h-3 w-3" />
            <span>Toque em</span>
            <Share className="h-3 w-3" />
            <span>→</span>
            <Plus className="h-3 w-3" />
            <span>"Adicionar à Tela de Início"</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/install')}
              className="flex-1"
            >
              Ver Tutorial
            </Button>
            <Button
              size="sm"
              onClick={() => setShowPrompt(false)}
              className="flex-1"
            >
              OK
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Renderiza prompt para Android/Desktop (quando deferredPrompt está disponível)
  if (deferredPrompt) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-xl bg-card border-border mx-auto max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Instalar Dindin</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <CardDescription className="text-sm">
            Instale o app para acesso rápido e funcionalidades offline
          </CardDescription>
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1 gap-2"
            >
              <Download className="h-4 w-4" />
              Instalar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/install')}
              className="flex-1"
            >
              Tutorial
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}