export const kgToLbs  = (kg)  => kg  ? Math.round(kg  * 2.20462 * 10) / 10 : null;
export const lbsToKg  = (lbs) => lbs ? Math.round(lbs / 2.20462 * 10) / 10 : null;
export const cmToFtIn = (cm)  => {
  if (!cm) return null;
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inc = Math.round(totalIn % 12);
  return { ft, in: inc, display: `${ft}'${inc}"` };
};
export const ftInToCm = (ft, inches) => Math.round((ft * 30.48) + (inches * 2.54));
export const displayWeight = (kg)  => kg  ? `${kgToLbs(kg)} lbs` : "—";
export const displayHeight = (cm)  => { const h = cmToFtIn(cm); return h ? h.display : "—"; };
export const calcBMI  = (kg, cm)   => (!kg || !cm) ? "—" : (kg / Math.pow(cm/100,2)).toFixed(1);
export const calcIBW  = (cm)       => !cm ? null : Math.round(45.5 + ((cm-152.4)/2.54)*2.3);
export const displayIBW = (cm)     => { const kg=calcIBW(cm); return kg ? `${kgToLbs(kg)} lbs` : "—"; };
export const bmiCategory = (v) => {
  const n = parseFloat(v);
  if (isNaN(n)) return { label:"—", c:"var(--muted)" };
  if (n<18.5) return { label:"Underweight", c:"var(--royal)" };
  if (n<25)   return { label:"Healthy",     c:"var(--emerald)" };
  if (n<30)   return { label:"Overweight",  c:"var(--amber)" };
  return        { label:"Obese",           c:"var(--rose)" };
};
