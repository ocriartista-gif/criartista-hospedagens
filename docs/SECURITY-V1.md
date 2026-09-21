# Segurança V1

## Política de senha

Enquanto o projeto Supabase estiver em um plano que não oferece Leaked Password Protection, o fluxo oficial de ativação do Criartista Hospedagens exige:

- mínimo de 10 caracteres;
- pelo menos uma letra minúscula;
- pelo menos uma letra maiúscula;
- pelo menos um número;
- pelo menos um símbolo.

A validação é aplicada na interface antes de `supabase.auth.updateUser({ password })`.

Quando o projeto for migrado para Supabase Pro ou superior, ativar também **Leaked Password Protection** nas configurações de Auth. Esta proteção é complementar e não substitui a política acima.
