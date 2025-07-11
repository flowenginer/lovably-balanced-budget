import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Share, 
  Plus, 
  Chrome,
  Globe,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InstallApp() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const iosSteps = [
    {
      icon: Globe,
      title: "1. Abra no Safari",
      description: "Certifique-se de estar usando o Safari (não Chrome ou outros navegadores)",
      detail: "O PWA só funciona no Safari no iOS"
    },
    {
      icon: Share,
      title: "2. Toque em Compartilhar",
      description: "Toque no ícone de compartilhamento na parte inferior da tela",
      detail: "Ícone que parece uma caixa com uma seta para cima"
    },
    {
      icon: Plus,
      title: "3. Adicionar à Tela de Início",
      description: "Role para baixo e toque em 'Adicionar à Tela de Início'",
      detail: "Pode ser necessário rolar na lista de opções"
    },
    {
      icon: CheckCircle,
      title: "4. Confirmar",
      description: "Toque em 'Adicionar' para finalizar a instalação",
      detail: "O app aparecerá na sua tela de início como um app nativo"
    }
  ];

  const androidSteps = [
    {
      icon: Chrome,
      title: "1. Abra no Chrome",
      description: "Acesse o app usando o navegador Chrome",
      detail: "Outros navegadores podem não suportar a instalação"
    },
    {
      icon: Download,
      title: "2. Banner de Instalação",
      description: "Um banner aparecerá automaticamente oferecendo a instalação",
      detail: "Se não aparecer, toque no menu (⋮) e procure 'Instalar app'"
    },
    {
      icon: Plus,
      title: "3. Instalar",
      description: "Toque em 'Instalar' ou 'Adicionar à tela inicial'",
      detail: "O processo é similar ao de instalar um app da Play Store"
    },
    {
      icon: CheckCircle,
      title: "4. Pronto!",
      description: "O app será instalado e aparecerá na sua tela inicial",
      detail: "Funciona como um app nativo, com ícone próprio"
    }
  ];

  const currentSteps = isIOS ? iosSteps : androidSteps;
  const deviceType = isIOS ? 'iPhone/iPad' : isAndroid ? 'Android' : 'Desktop';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Instalar Dindin</h1>
            <p className="text-muted-foreground">Baixe o app na sua tela inicial</p>
          </div>
        </div>

        {/* Device Detection */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Dispositivo Detectado</CardTitle>
                <CardDescription>
                  Instruções personalizadas para seu dispositivo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="mb-4">
              {deviceType}
            </Badge>
            {!isIOS && !isAndroid && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Você está no desktop. Para instalar como PWA, acesse este site no seu celular ou use o Chrome no desktop (Menu &gt; Instalar Dindin).
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        {(isIOS || isAndroid) && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Como Instalar</h2>
            
            {currentSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive ? 'ring-2 ring-primary border-primary' : ''
                  } ${isCompleted ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-green-100 dark:bg-green-900' : 
                        isActive ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <StepIcon className={`h-6 w-6 ${
                          isCompleted ? 'text-green-600 dark:text-green-400' :
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                        <p className="text-muted-foreground mb-2">{step.description}</p>
                        <p className="text-sm text-muted-foreground/80">{step.detail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Por que instalar?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Acesso rápido pela tela inicial</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Funciona offline para consultas</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Interface otimizada para mobile</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Notificações de lembretes (em breve)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        {(isIOS || isAndroid) && (
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} de {currentSteps.length}
            </span>
            
            <Button
              onClick={() => setCurrentStep(Math.min(currentSteps.length - 1, currentStep + 1))}
              disabled={currentStep === currentSteps.length - 1}
            >
              Próximo
            </Button>
          </div>
        )}

        {/* Help */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Precisa de ajuda?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Se você não conseguir instalar o app, tente:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Certifique-se de estar usando o navegador correto</li>
              <li>Atualize seu navegador para a versão mais recente</li>
              <li>Limpe o cache e tente novamente</li>
              <li>Reinicie o navegador</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}