
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User, Settings as SettingsIcon, Shield, Bell, Palette, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    weeklyReports: false,
    budgetAlerts: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
  });

  const handleProfileUpdate = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados serão enviados por email em breve.",
    });
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
    if (confirm) {
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
        variant: "destructive",
      });
      logout();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e configurações da conta</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">
                {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="font-medium">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary">Usuário Premium</Badge>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
              />
            </div>
          </div>

          <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas por Email</p>
              <p className="text-sm text-muted-foreground">Receba alertas importantes por email</p>
            </div>
            <Switch
              checked={notifications.emailAlerts}
              onCheckedChange={(checked) => 
                setNotifications({...notifications, emailAlerts: checked})
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações Push</p>
              <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
            </div>
            <Switch
              checked={notifications.pushNotifications}
              onCheckedChange={(checked) => 
                setNotifications({...notifications, pushNotifications: checked})
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Relatórios Semanais</p>
              <p className="text-sm text-muted-foreground">Receba resumo semanal das finanças</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => 
                setNotifications({...notifications, weeklyReports: checked})
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Orçamento</p>
              <p className="text-sm text-muted-foreground">Receba avisos quando exceder limites</p>
            </div>
            <Switch
              checked={notifications.budgetAlerts}
              onCheckedChange={(checked) => 
                setNotifications({...notifications, budgetAlerts: checked})
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Aparência
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Modo Escuro</p>
              <p className="text-sm text-muted-foreground">Alterne entre tema claro e escuro</p>
            </div>
            <Switch
              checked={preferences.darkMode}
              onCheckedChange={(checked) => 
                setPreferences({...preferences, darkMode: checked})
              }
            />
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <select
                id="language"
                className="w-full p-2 border rounded-md"
                value={preferences.language}
                onChange={(e) => setPreferences({...preferences, language: e.target.value})}
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <select
                id="currency"
                className="w-full p-2 border rounded-md"
                value={preferences.currency}
                onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
              >
                <option value="BRL">Real (R$)</option>
                <option value="USD">Dólar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança e Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            Alterar Senha
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            Ativar Autenticação de Dois Fatores
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Meus Dados
          </Button>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-destructive">Zona de Perigo</h4>
            <p className="text-sm text-muted-foreground">
              Ações irreversíveis que afetarão permanentemente sua conta.
            </p>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              className="w-full md:w-auto"
            >
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Informações do App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Versão:</span>
            <span className="text-sm font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Última atualização:</span>
            <span className="text-sm font-medium">07/01/2025</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm">Desenvolvido por:</span>
            <span className="text-sm font-medium">FinanceAI Team</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
