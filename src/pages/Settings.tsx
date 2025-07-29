import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Settings as SettingsIcon, 
  CreditCard, 
  Target, 
  Bookmark, 
  Tag, 
  Download, 
  MessageSquare, 
  Upload,
  ArrowLeft,
  Wallet,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Settings() {
  const { logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const menuItems = [
    {
      icon: Wallet,
      title: "Contas",
      description: "Gerencie suas contas bancárias",
      path: "/accounts",
      action: () => navigate("/accounts")
    },
    {
      icon: CreditCard,
      title: "Cartões de crédito",
      description: "Configure seus cartões",
      path: "/cards",
      action: () => navigate("/cards")
    },
    {
      icon: Target,
      title: "Objetivos",
      description: "Defina e acompanhe suas metas",
      path: "/goals",
      action: () => navigate("/goals")
    },
    {
      icon: Bookmark,
      title: "Categorias",
      description: "Organize suas transações",
      path: "/categories",
      action: () => navigate("/categories")
    },
    {
      icon: Tag,
      title: "Tags",
      description: "Etiquetas para transações",
      path: "/tags",
      action: () => navigate("/tags")
    },
    {
      icon: Download,
      title: "Importar dados",
      description: "Importe dados de outros apps",
      action: () => {
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Esta funcionalidade estará disponível em breve."
        });
      }
    },
    {
      icon: MessageSquare,
      title: "Importar SMS",
      description: "Importe transações via SMS",
      action: () => {
        toast({
          title: "Funcionalidade em desenvolvimento",
          description: "Esta funcionalidade estará disponível em breve."
        });
      }
    },
    {
      icon: Upload,
      title: "Exportar relatórios",
      description: "Exporte seus dados financeiros",
      action: () => {
        toast({
          title: "Exportação iniciada",
          description: "Seus dados serão enviados por email em breve."
        });
      }
    }
  ];

  if (!isMobile) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Mais Opções</h1>
          <p className="text-muted-foreground">Gerencie suas configurações e dados</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-6 flex flex-col items-start gap-3 hover:bg-muted/50"
              onClick={item.action}
            >
              <item.icon className="h-6 w-6 text-primary" />
              <div className="text-left">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold">Mais Opções</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="rounded-full px-6"
          >
            Gerenciar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-6 text-muted-foreground"
            disabled
          >
            Acompanhar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full px-6 text-muted-foreground"
            disabled
          >
            Sobre
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-1">
        {menuItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full h-auto p-4 flex items-center justify-between hover:bg-muted/50"
            onClick={item.action}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{item.title}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        ))}
      </div>
    </div>
  );
}
