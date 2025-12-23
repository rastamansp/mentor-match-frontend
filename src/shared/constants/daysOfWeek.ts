export const DAYS_OF_WEEK = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
} as const;

export const getDayName = (dayOfWeek: number): string => {
  return DAYS_OF_WEEK[dayOfWeek as keyof typeof DAYS_OF_WEEK] || 'Desconhecido';
};
