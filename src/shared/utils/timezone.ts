/**
 * Utilitários para conversão de timezone
 */

/**
 * Converte data/hora local + timezone para UTC (ISO datetime)
 * @param date Data no formato Date ou string YYYY-MM-DD
 * @param time Horário no formato HH:MM
 * @param timezone Timezone IANA (ex: "America/Sao_Paulo")
 * @returns ISO datetime string em UTC
 */
export function convertLocalToUtc(
  date: Date | string,
  time: string,
  timezone: string = 'America/Sao_Paulo'
): string {
  // Se date é string, converte para Date
  let dateObj: Date;
  if (typeof date === 'string') {
    // Se já tem T, é ISO datetime
    if (date.includes('T')) {
      dateObj = new Date(date);
    } else {
      // É apenas data YYYY-MM-DD
      dateObj = new Date(date + 'T00:00:00');
    }
  } else {
    dateObj = new Date(date);
  }

  // Extrai horas e minutos do time
  const [hours, minutes] = time.split(':').map(Number);

  // Cria uma string no formato YYYY-MM-DDTHH:MM:SS
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');

  // Cria uma string representando a data/hora local no formato ISO
  const localDateTimeString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00`;

  // Método mais direto: usa uma data de referência para calcular o offset do timezone
  // Cria uma data temporária em UTC
  const tempUtc = new Date(localDateTimeString + 'Z');
  
  // Formata essa data no timezone especificado para obter o que seria a hora local
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
  
  const parts = formatter.formatToParts(tempUtc);
  const tzYear = parseInt(parts.find(p => p.type === 'year')!.value);
  const tzMonth = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
  const tzDay = parseInt(parts.find(p => p.type === 'day')!.value);
  const tzHour = parseInt(parts.find(p => p.type === 'hour')!.value);
  const tzMinute = parseInt(parts.find(p => p.type === 'minute')!.value);
  
  // Cria uma data UTC com os valores que apareceriam no timezone
  const tzAsUtc = new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute));
  
  // Calcula o offset: diferença entre tempUtc e tzAsUtc
  const offsetMs = tempUtc.getTime() - tzAsUtc.getTime();
  
  // Agora cria a data final que queremos converter
  // Assumimos que localDateTimeString está no timezone especificado
  // Criamos uma data UTC que representa esse momento
  const targetLocal = new Date(`${year}-${month}-${day}T${hoursStr}:${minutesStr}:00`);
  
  // Ajusta pelo offset para obter o UTC correto
  // Se o timezone está atrás de UTC (offset negativo), adicionamos o offset
  // Se o timezone está à frente de UTC (offset positivo), subtraímos o offset
  const utcTime = targetLocal.getTime() - offsetMs;
  
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
