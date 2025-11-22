// Cálculo de Signo Solar baseado na data de nascimento

const ZODIAC_SIGNS = [
  { sign: "Capricórnio", symbol: "♑", start: [12, 22], end: [1, 19] },
  { sign: "Aquário", symbol: "♒", start: [1, 20], end: [2, 18] },
  { sign: "Peixes", symbol: "♓", start: [2, 19], end: [3, 20] },
  { sign: "Áries", symbol: "♈", start: [3, 21], end: [4, 19] },
  { sign: "Touro", symbol: "♉", start: [4, 20], end: [5, 20] },
  { sign: "Gêmeos", symbol: "♊", start: [5, 21], end: [6, 20] },
  { sign: "Câncer", symbol: "♋", start: [6, 21], end: [7, 22] },
  { sign: "Leão", symbol: "♌", start: [7, 23], end: [8, 22] },
  { sign: "Virgem", symbol: "♍", start: [8, 23], end: [9, 22] },
  { sign: "Libra", symbol: "♎", start: [9, 23], end: [10, 22] },
  { sign: "Escorpião", symbol: "♏", start: [10, 23], end: [11, 21] },
  { sign: "Sagitário", symbol: "♐", start: [11, 22], end: [12, 21] }
];

export function calculateSunSign(dateString) {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  for (const zodiac of ZODIAC_SIGNS) {
    const [startMonth, startDay] = zodiac.start;
    const [endMonth, endDay] = zodiac.end;
    
    if (zodiac.sign === "Capricórnio") {
      if ((month === 12 && day >= startDay) || (month === 1 && day <= endDay)) {
        return `${zodiac.symbol} ${zodiac.sign}`;
      }
    } else {
      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (startMonth < endMonth && month > startMonth && month < endMonth)
      ) {
        return `${zodiac.symbol} ${zodiac.sign}`;
      }
    }
  }
  
  return null;
}