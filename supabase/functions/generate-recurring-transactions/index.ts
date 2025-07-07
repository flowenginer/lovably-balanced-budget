import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const today = new Date()
    const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    // Get all recurring transactions from the previous month
    const { data: recurringTransactions, error: fetchError } = await supabaseClient
      .from('transactions')
      .select(`
        *,
        categories!inner(*),
        accounts!inner(*)
      `)
      .eq('is_recurring', true)
      .lt('date', firstDayOfCurrentMonth.toISOString().split('T')[0])

    if (fetchError) {
      console.error('Error fetching recurring transactions:', fetchError)
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!recurringTransactions || recurringTransactions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No recurring transactions found' }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const newTransactions = []

    for (const transaction of recurringTransactions) {
      // Check if this recurring transaction already has a version for this month
      const { data: existingTransaction } = await supabaseClient
        .from('transactions')
        .select('id')
        .eq('user_id', transaction.user_id)
        .eq('category_id', transaction.category_id)
        .eq('account_id', transaction.account_id)
        .eq('description', transaction.description)
        .eq('amount', transaction.amount)
        .eq('is_recurring', true)
        .gte('date', firstDayOfCurrentMonth.toISOString().split('T')[0])
        .lt('date', firstDayOfNextMonth.toISOString().split('T')[0])
        .single()

      // If no transaction exists for this month, create one
      if (!existingTransaction) {
        const originalDate = new Date(transaction.date)
        const newDate = new Date(today.getFullYear(), today.getMonth(), originalDate.getDate())
        
        // If the day doesn't exist in current month (e.g., Feb 30), use last day of month
        if (newDate.getMonth() !== today.getMonth()) {
          newDate.setDate(0) // Sets to last day of previous month
        }

        newTransactions.push({
          user_id: transaction.user_id,
          type: transaction.type,
          category_id: transaction.category_id,
          account_id: transaction.account_id,
          description: transaction.description,
          amount: transaction.amount,
          date: newDate.toISOString().split('T')[0],
          payment_method: transaction.payment_method,
          is_recurring: true,
          observations: transaction.observations,
          entity_type: transaction.entity_type,
          attachment_url: transaction.attachment_url,
          pix_key: transaction.pix_key,
          pix_key_type: transaction.pix_key_type,
          bank_name: transaction.bank_name,
          bank_agency: transaction.bank_agency,
          bank_account: transaction.bank_account,
          bank_cpf_cnpj: transaction.bank_cpf_cnpj
        })
      }
    }

    if (newTransactions.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('transactions')
        .insert(newTransactions)

      if (insertError) {
        console.error('Error creating recurring transactions:', insertError)
        return new Response(
          JSON.stringify({ error: insertError.message }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Generated ${newTransactions.length} recurring transactions`,
        count: newTransactions.length
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in generate-recurring-transactions function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})