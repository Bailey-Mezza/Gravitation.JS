// Gravitation strength for this simulation (pixels / tick^2).
// Tuned for dt=1 and scale=1; higher = faster orbits, lower = slower.
export const G = 0.2;
// Palette for planet colors (used for random assignment).
// Keep high contrast with the background; add/remove as needed.
export const colorArray = [
  'rgb(244, 162, 97)', 
  'rgb(42, 157, 143)', 
  'rgb(58, 134, 255)',  
  'rgb(231, 111, 81)',  
  'rgb(255, 190, 11)', 
  'rgb(251, 86, 7)',    
  'rgb(131, 56, 236)',  
  'rgb(255, 0, 110)',   
  'rgb(106, 153, 78)',  
  'rgb(212, 163, 115)', 
  'rgb(17, 138, 178)',  
  'rgb(7, 59, 76)',    
  'rgb(242, 132, 130)', 
  'rgb(141, 153, 174)'  
];

