// components/Icons.js
export function IconBurger(props) {
  return (
    <svg
      {...props} 
      viewBox="0 0 64 64" fill="none" stroke="#FFD633" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round"
      >
      <rect x="10" y="22" width="44" height="12" rx="6" ry="6" fill="#f4a261" />
      <line x1="10" y1="25" x2="54" y2="25" stroke="#e76f51" strokeWidth="2" />
      <rect x="12" y="18" width="40" height="6" rx="3" ry="3" fill="#2a9d8f" />
      <rect x="12" y="34" width="40" height="4" rx="2" ry="2" fill="#e9c46a" />
    </svg>
  );
}

export function IconFries(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 64 64" fill="none" stroke="#FFD633" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round"
      >
      <rect x="22" y="10" width="20" height="40" fill="#f4a261" />
      <line x1="26" y1="10" x2="26" y2="50" stroke="#e76f51" strokeWidth="2" />
      <line x1="46" y1="10" x2="46" y2="50" stroke="#e76f51" strokeWidth="2" />
      <circle cx="32" cy="36" r="6" fill="#e9c46a" />
    </svg>
  );
}

export function IconDrink(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 64 64" fill="none" stroke="#FFD633" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round"
      >
      <rect x="24" y="14" width="16" height="32" rx="4" ry="4" fill="#00bfff" />
      <line x1="24" y1="14" x2="24" y2="48" stroke="#0288d1" strokeWidth="2" />
      <line x1="40" y1="14" x2="40" y2="48" stroke="#0288d1" strokeWidth="2" />
      <polyline points="32,2 28,14 36,14 32,2" fill="#81d4fa" />
    </svg>
  );
}