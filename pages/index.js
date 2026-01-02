import { useState } from "react";

const položky = [
  "Cheseburger",
  "Steak House Burger",
  "Big King",
  "Double Cheseburger",
  "Big King XXL",
  "Fries",
  "Menu",
  "Pití",
];

const burgery = [
  "Cheseburger",
  "Steak House Burger",
  "Big King",
  "Double Cheseburger",
  "Big King XXL",
];

const pití = ["Voda", "E-Cola", "Minerálka"];

const hranolky = ["Fries", "Není"];

export default function Home() {
  const [objednávka, setObjednávka] = useState(
    položky.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
  );
  const [menuDetail, setMenuDetail] = useState({
    burger: "Cheseburger",
    pití: "Voda",
    hranolky: "Fries",
  });
  const [sleva, setSleva] = useState("");
  const [zaplaceno, setZaplaceno] = useState("");
  const [výsledek, setVýsledek] = useState(null);
  const [chyba, setChyba] = useState(null);

  const změňMnožství = (položka, hodnota) => {
    setObjednávka((prev) => ({
      ...prev,
      [položka]: Math.max(0, Number(hodnota)),
    }));
  };

  const přidej = (položka) => {
    změňMnožství(položka, objednávka[položka] + 1);
  };
  const uber = (položka) => {
    změňMnožství(položka, objednávka[položka] - 1);
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
          zaplaceno,
          menu_detail: objednávka.Menu > 0 ? menuDetail : null,
        }),
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
    <div style={{ maxWidth: 700, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Pokladna Burger Shot</h1>

      <table style={{ width: "100%", marginBottom: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Položka</th>
            <th>Cena ($)</th>
            <th style={{ width: 150 }}>Množství</th>
          </tr>
        </thead>
        <tbody>
          {položky.map((položka) => {
            const cena = (() => {
              switch (položka) {
                case "Cheseburger":
                  return 700;
                case "Steak House Burger":
                  return 900;
                case "Big King":
                  return 1000;
                case "Double Cheseburger":
                  return 1200;
                case "Big King XXL":
                  return 1500;
                case "Fries":
                  return 200;
                case "Menu":
                  return 2000;
                case "Pití":
                  return 5;
                default:
                  return "-";
              }
            })();

            return (
              <tr key={položka}>
                <td>
                  {položka}
                  {položka === "Menu" && (
                    <div style={{ fontSize: 12, color: "#777" }}>
                      (Burger, pití a hranolky)
                    </div>
                  )}
                </td>
                <td>{cena}</td>
                <td>
                  <button onClick={() => uber(položka)} disabled={objednávka[položka] === 0}>
                    –
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={objednávka[položka]}
                    onChange={(e) => změňMnožství(položka, e.target.value)}
                    style={{ width: 40, textAlign: "center", margin: "0 5px" }}
                  />
                  <button onClick={() => přidej(položka)}>+</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Detail vybraný u Menu */}
      {objednávka.Menu > 0 && (
        <div
          style={{
            backgroundColor: "#222",
            padding: 10,
            borderRadius: 5,
            color: "#f5f5f5",
            marginBottom: 20,
          }}
        >
          <h3>Vyber položky pro Menu</h3>

          <label>
            Burger:{" "}
            <select
              value={menuDetail.burger}
              onChange={(e) =>
                setMenuDetail((old) => ({ ...old, burger: e.target.value }))
              }
            >
              {burgery.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <br />

          <label>
            Pití:{" "}
            <select
              value={menuDetail.pití}
              onChange={(e) =>
                setMenuDetail((old) => ({ ...old, pití: e.target.value }))
              }
            >
              {pití.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>

          <br />

          <label>
            Hranolky:{" "}
            <select
              value={menuDetail.hranolky}
              onChange={(e) =>
                setMenuDetail((old) => ({ ...old, hranolky: e.target.value }))
              }
            >
              {hranolky.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <label>
          Sleva %:{" "}
          <input
            type="number"
            min="0"
            step="0.01"
            value={sleva}
            onChange={(e) => setSleva(e.target.value)}
            style={{ width: 100 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Zaplaceno ($):{" "}
          <input
            type="number"
            min="0"
            step="0.01"
            value={zaplaceno}
            onChange={(e) => setZaplaceno(e.target.value)}
            style={{ width: 100 }}
          />
        </label>
      </div>

      <button
        onClick={spočti}
        style={{ padding: "10px 20px", cursor: "pointer", marginBottom: 20 }}
      >
        Spočítat
      </button>

      {chyba && <p style={{ color: "red" }}>{chyba}</p>}

      {výsledek && (
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
          <h2>Výsledek objednávky</h2>

          {Object.entries(objednávka)
            .filter(([_, qty]) => qty > 0)
            .map(([p, q]) => {
              if (p === "Menu") {
                const detail = [
                  menuDetail.burger,
                  menuDetail.pití,
                  menuDetail.hranolky === "Není" ? null : menuDetail.hranolky,
                ]
                  .filter(Boolean)
                  .join(", ");
                return `${q}x ..... Menu (${detail})`;
              }
              return `${q}x ..... ${p}`;
            })
            .join("\n")}

          {`\nCelkem: ${výsledek.cena_po_sleve} $`}
          {výsledek.slevaProcenta > 0
            ? ` (sleva ${výsledek.slevaProcenta}%)\n`
            : "\n"}

          {výsledek.zaplaceno !== null && (
            <>
              {`Zaplaceno: ${výsledek.zaplaceno} $\n`}
              {`Vráceno: ${
                výsleděk.vraceno >= 0 ? výsleděk.vraceno.toFixed(2) : "Chybí platba"
              } $`}
            </>
          )}

          <h3 style={{ marginTop: 20 }}>Zde je ceník:</h3>
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
  );
}