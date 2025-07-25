
import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Target,
  PieChart,
  Calendar
} from 'lucide-react';

export default function AIFinance() {
  const { transactions, getBalance, getMonthlyData } = useFinancial();
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const balance = getBalance();
  const monthlyData = getMonthlyData();
  const savings = monthlyData.income - monthlyData.expenses;
  const savingsRate = monthlyData.income > 0 ? (savings / monthlyData.income) * 100 : 0;

  // AI Insights based on data analysis
  const getFinancialInsights = () => {
    const insights = [];

    // Savings rate analysis
    if (savingsRate > 20) {
      insights.push({
        type: 'positive',
        icon: CheckCircle,
        title: 'Excelente Taxa de Economia',
        description: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Continue assim!`,
        priority: 'high'
      });
    } else if (savingsRate < 10 && savingsRate > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Taxa de Economia Baixa',
        description: `Sua taxa de economia está em ${savingsRate.toFixed(1)}%. Tente aumentar para pelo menos 20%.`,
        priority: 'high'
      });
    } else if (savingsRate <= 0) {
      insights.push({
        type: 'negative',
        icon: TrendingDown,
        title: 'Gastos Superiores à Renda',
        description: 'Suas despesas estão superando sua renda. É importante revisar seus gastos.',
        priority: 'critical'
      });
    }

    // Spending pattern analysis
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (topExpenseCategory && monthlyData.expenses > 0) {
      const categoryPercentage = ((topExpenseCategory[1] as number) / monthlyData.expenses) * 100;
      if (categoryPercentage > 40) {
        insights.push({
          type: 'warning',
          icon: PieChart,
          title: 'Concentração Alta de Gastos',
          description: `${categoryPercentage.toFixed(1)}% dos seus gastos estão em "${topExpenseCategory[0]}". Considere diversificar.`,
          priority: 'medium'
        });
      }
    }

    // Balance analysis
    if (balance > monthlyData.income * 6) {
      insights.push({
        type: 'positive',
        icon: Target,
        title: 'Reserva de Emergência Sólida',
        description: 'Você tem uma excelente reserva de emergência. Considere investir o excedente.',
        priority: 'low'
      });
    } else if (balance < monthlyData.income * 3) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Reserva de Emergência Insuficiente',
        description: 'Recomenda-se ter pelo menos 3-6 meses de despesas como reserva de emergência.',
        priority: 'high'
      });
    }

    return insights.sort((a, b) => {
      const priority = { critical: 4, high: 3, medium: 2, low: 1 };
      return priority[b.priority as keyof typeof priority] - priority[a.priority as keyof typeof priority];
    });
  };

  const getFinancialTips = () => {
    const tips = [];
    
    tips.push(
      {
        title: 'Regra 50/30/20',
        description: 'Destine 50% para necessidades, 30% para desejos e 20% para poupança e investimentos.',
        category: 'Planejamento'
      },
      {
        title: 'Automatize suas Economias',
        description: 'Configure transferências automáticas para sua poupança logo após receber o salário.',
        category: 'Automatização'
      },
      {
        title: 'Controle de Gastos Variáveis',
        description: 'Monitore gastos com entretenimento e alimentação fora de casa - são onde mais perdemos controle.',
        category: 'Controle'
      }
    );

    return tips;
  };

  const handleAIQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setAiResponse('');

    // Simulate AI processing
    setTimeout(() => {
      let response = '';

      if (question.toLowerCase().includes('economia') || question.toLowerCase().includes('poupar')) {
        response = `Com base na sua situação atual (taxa de economia de ${savingsRate.toFixed(1)}%), sugiro:\n\n1. Identifique gastos desnecessários\n2. Defina metas de economia específicas\n3. Automatize suas economias\n4. Considere investimentos de baixo risco`;
      } else if (question.toLowerCase().includes('investir') || question.toLowerCase().includes('investimento')) {
        response = `Para seu perfil financeiro atual:\n\n1. Primeiro, mantenha uma reserva de emergência\n2. Considere fundos de investimento conservadores\n3. Diversifique seus investimentos\n4. Estude sobre renda fixa e variável`;
      } else if (question.toLowerCase().includes('despesa') || question.toLowerCase().includes('gasto')) {
        response = `Analisando seus gastos:\n\n1. Categorize todas as despesas\n2. Identifique gastos supérfluos\n3. Negocie contas fixas (internet, telefone)\n4. Use a regra dos 30 dias para compras grandes`;
      } else {
        response = `Com base nos seus dados financeiros:\n\nSaldo atual: R$ ${balance.toLocaleString('pt-BR')}\nReceitas mensais: R$ ${monthlyData.income.toLocaleString('pt-BR')}\nDespesas mensais: R$ ${monthlyData.expenses.toLocaleString('pt-BR')}\n\nSugiro focar em otimizar sua taxa de economia e manter um controle rigoroso das despesas variáveis.`;
      }

      setAiResponse(response);
      setIsLoading(false);
    }, 2000);
  };

  const insights = getFinancialInsights();
  const tips = getFinancialTips();

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">IA Financeira</h1>
        <p className="text-muted-foreground">
          Insights inteligentes para suas finanças
        </p>
      </div>

      {/* AI Chat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Consultor IA Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Pergunte sobre suas finanças... (ex: Como posso economizar mais?)"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()}
            />
            <Button onClick={handleAIQuestion} disabled={isLoading}>
              {isLoading ? 'Analisando...' : 'Perguntar'}
            </Button>
          </div>
          
          {aiResponse && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Resposta da IA:
              </h4>
              <pre className="whitespace-pre-wrap text-sm">{aiResponse}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>Score de Saúde Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Score Geral</span>
                <span className="text-sm text-muted-foreground">
                  {Math.max(0, Math.min(100, 50 + savingsRate * 2)).toFixed(0)}/100
                </span>
              </div>
              <Progress value={Math.max(0, Math.min(100, 50 + savingsRate * 2))} className="h-3" />
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {savingsRate > 0 ? savingsRate.toFixed(1) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa de Economia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {transactions.length}
                </div>
                <div className="text-sm text-muted-foreground">Transações</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {Math.abs(balance).toLocaleString('pt-BR')}
                </div>
                <div className="text-sm text-muted-foreground">Saldo</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <insight.icon className="h-5 w-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm mt-1">{insight.description}</p>
                      </div>
                    </div>
                    <Badge className={getPriorityBadge(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Adicione mais transações para receber insights personalizados
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Financial Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas Financeiras Personalizadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {tip.category}
                    </Badge>
                    <h4 className="font-medium mb-2">{tip.title}</h4>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
