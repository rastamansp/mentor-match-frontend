/**
 * Utilitários para conversão de timezone
 */

/**
 * Converte data/hora local + timezone para UTC (ISO datetime)
 * @param date Data no formato Date ou string YYYY-MM-DD
 * @param time Horário no formato HH:MM
 * @param timezone Timezone IANA (ex: "America/Sao_Paulo")
 * @returns ISO datetime string em UTC
 * 
 * Exemplo: 
 * - date: "2026-01-22", time: "22:00", timezone: "America/Sao_Paulo" (UTC-3)
 * - Resultado: "2026-01-23T01:00:00.000Z" (22h local + 3h = 01h UTC do dia seguinte)
 * 
 * Método: Usa duas datas de referência para calcular o offset do timezone
 * e depois aplica esse offset à data/hora local desejada.
 */
export function convertLocalToUtc(
  date: Date | string,
  time: string,
  timezone: string = 'America/Sao_Paulo'
): string {
  // Extrai a data
  let dateStr: string;
  if (typeof date === 'string') {
    if (date.includes('T')) {
      // Se já tem T, extrai apenas a parte da data
      dateStr = date.split('T')[0];
    } else {
      dateStr = date;
    }
  } else {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  }

  // Extrai horas e minutos do time
  const [hours, minutes] = time.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);

  // Método correto: usar a própria data/hora desejada para calcular o offset
  // Isso garante que o offset seja calculado para o momento exato
  
  // 1. Cria uma data UTC assumindo que a data/hora local está em UTC
  // Exemplo: 2026-01-22 22:00:00 UTC
  const localAsUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  
  // 2. Formata essa data no timezone especificado para ver como ela aparece
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const parts = formatter.formatToParts(localAsUtc);
  const tzYear = parseInt(parts.find(p => p.type === 'year')!.value);
  const tzMonth = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
  const tzDay = parseInt(parts.find(p => p.type === 'day')!.value);
  const tzHour = parseInt(parts.find(p => p.type === 'hour')!.value);
  const tzMinute = parseInt(parts.find(p => p.type === 'minute')!.value);
  
  // 3. Cria uma data UTC representando o que seria a data/hora local no timezone
  // Exemplo: se localAsUtc é 22:00 UTC, e no timezone aparece como 19:00,
  // então tzAsUtc = 19:00 UTC
  const tzAsUtc = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute));
  
  // 4. Calcula o offset em milissegundos
  // Se localAsUtc é 22:00 UTC e no timezone aparece como 19:00, então offset = +3 horas
  // Isso significa que o timezone está 3 horas atrás de UTC (UTC-3)
  // offsetMs será positivo quando o timezone está atrás de UTC
  const offsetMs = localAsUtc.getTime() - tzAsUtc.getTime();
  
  // 5. Ajusta pelo offset para obter o UTC correto
  // Queremos que a data/hora local apareça como a data/hora desejada no timezone
  // Se queremos 22:00 no timezone e o timezone está 3h atrás (UTC-3),
  // então precisamos de 01:00 UTC do dia seguinte (22:00 + 3h = 01:00)
  // Então: utcTime = localAsUtc + offset
  // Se offset é +3h (10800000 ms), então 22:00 UTC + 3h = 01:00 UTC do dia seguinte
  const utcTime = localAsUtc.getTime() + offsetMs;
  
  return new Date(utcTime).toISOString();
}

/**
 * Converte UTC para data/hora local em um timezone específico
 * @param utcDateTime ISO datetime string em UTC
 * @param timezone Timezone IANA (ex: "America/Sao_Paulo")
 * @returns Objeto com date (YYYY-MM-DD) e time (HH:MM)
 */
export function convertUtcToLocal(
  utcDateTime: string,
  timezone: string = 'America/Sao_Paulo'
): { date: string; time: string } {
  const date = new Date(utcDateTime);
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  
  const year = parts.find(p => p.type === 'year')!.value;
  const month = parts.find(p => p.type === 'month')!.value;
  const day = parts.find(p => p.type === 'day')!.value;
  const hour = parts.find(p => p.type === 'hour')!.value;
  const minute = parts.find(p => p.type === 'minute')!.value;

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
  };
}

/**
 * Calcula endAtUtc baseado em startAtUtc e duration
 * @param startAtUtc ISO datetime UTC de início
 * @param duration Duração em minutos
 * @returns ISO datetime UTC de término
 */
export function calculateEndAtUtc(startAtUtc: string, duration: number): string {
  const startDate = new Date(startAtUtc);
  const endDate = new Date(startDate.getTime() + duration * 60 * 1000);
  return endDate.toISOString();
}
