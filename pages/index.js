// pages/index.js
import { useState } from "react";

const položky = [
  "Cheseburger",
  "Steak House Burger",
  "Big King",
  "Double Cheseburger",
  "Big King XXL",
  "Fries",
  "Menu",
  "Pití"
];

export default function Home() {
  const [objednávka, setObjednávka] = useState(
    položky.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
  );
  const [sleva, setSleva] = useState("");
  const [zaplaceno, setZaplaceno] = useState("");
  const [výsledek, setVýsledek] = useState(null);
  const [chyba, setChyba] = useState(null);

  const změňMnožství = (položka, hodnota) => {
    setObjednávka(prev => ({
      ...prev,
      [položka]: Math.max(0, Number(hodnota))
    }));
  };

  const spočti = async () => {
    setChyba(null);
    setVýsledek(null);

    try {
      const res = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objednávka,
          sleva,
          zaplaceno
        })
      });
      if (!res.ok) {
        const { error } = await res.json();
        setChyba(error || "Nepodařilo se spočítat.");
        return;
      }
      const data = await res.json();
      setVýsledek(data);
    } catch (e) {
      setChyba("Chyba serveru.");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Pokladna Burger Shot</h1>
      <table style={{ width: "100%", marginBottom: 20, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Položka</th>
            <th>Cena ($)</th>
            <th>Množství</th>
          </tr>
        </thead>
        <tbody>
          {položky.map(položka => (
            <tr key={položka}>
              <td>{položka}</td>
              <td>
                {(() => {
                  switch(položka) {
                    case "Cheseburger": return "700";
                    case "Steak House Burger": return "900";
                    case "Big King": return "1000";
                    case "Double Cheseburger": return "1200";
                    case "Big King XXL": return "1500";
                    case "Fries": return "200";
                    case "Menu": return "2000";
                    case "Pití": return "5";
                    default: return "-";
                  }
                })()}
              </td>
              <td>
                <input 
                  type="number" 
                  min="0" 
                  value={objednávka[položka]} 
                  onChange={e => změňMnožství(položka, e.target.value)} 
                  style={{width: 50}} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginBottom: 10 }}>
        <label>Sleva %: </label>
        <input 
          type="number" 
          min="0" step="0.01" 
          value={sleva} 
          onChange={e => setSleva(e.target.value)} 
          style={{width: 100}} 
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Zaplaceno ($): </label>
        <input 
          type="number" 
          min="0" step="0.01" 
          value={zaplaceno} 
          onChange={e => setZaplaceno(e.target.value)} 
          style={{width: 100}} 
        />
      </div>

      <button onClick={spočti} style={{ padding: "10px 20px", cursor: "pointer" }}>
        Spočítat
      </button>

      {chyba && <p style={{color: "red"}}>{chyba}</p>}
      
      {výsledek && (
        <div style={{ marginTop: 20 }}>
          <h2>Výsledek objednávky</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {Object.entries(objednávka)
              .filter(([_, qty]) => qty > 0)
              .map(([p, q]) => `${q}x ..... ${p}`)
              .join('\n')}
            {"\n"}Celkem: {výsledek.cena_po_sleve} $
            {výsledek.slevaProcenta > 0 ? ` (sleva ${výsledek.slevaProcenta}%)` : ""}
            {výsledek.zaplaceno !== null && (
              <>
                {"\n"}Zaplaceno: {výsledek.zaplaceno} $
                {"\n"}Vráceno: {výsledek.vraceno >= 0 ? výsleděk.vraceno : "Chybí platba"} $
              </>
            )}
          </pre>

          <h3>Zde je ceník:</h3>
          <ul>
            <li>Cheseburger - 700$</li>
            <li>Steak House Burger - 900$</li>
            <li>Big King - 1000$</li>
            <li>Double Cheseburger - 1200$</li>
            <li>Big King XXL - 1500$</li>
            <li>Fries - 200$</li>
            <li>Menu (burger, pití a hranolky) - 2000$</li>
            <li>Pití - 5$</li>
          </ul>
        </div>
      )}
    </div>
  )
}