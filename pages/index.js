import { useState, useEffect } from "react";

// Položky a nabídka
const položky = [
  "Cheseburger",
  "Steak House Burger",
  "Big King",
  "Double Cheseburger",
  "Big King XXL",
  "Fries",
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
  // Stav pro správu směny a uživatele
  const [userName, setUserName] = useState("");
  const [shiftStart, setShiftStart] = useState(null);
  const [shiftEnd, setShiftEnd] = useState(null);
  const [totalSales, setTotalSales] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);

  // Stav pokladny
  const [ostatníPolozky, setOstatníPolozky] = useState(
    položky.reduce((acc, p) => ({ ...acc, [p]: 0 }), {})
  );
  const [menu, setMenu] = useState([]);
  const [novéMenu, setNovéMenu] = useState({
    burger: "Cheseburger",
    pití: "Voda",
    hranolky: "Fries",
  });
  const [sleva, setSleva] = useState("");
  const [zaplaceno, setZaplaceno] = useState("");
  const [výsledek, setVýsledek] = useState(null);
  const [chyba, setChyba] = useState(null);

  // Načti data ze storage při startu
  useEffect(() => {
    if (typeof window === "undefined") return;
    const dataStr = localStorage.getItem("shiftData");
    if (dataStr) {
      const data = JSON.parse(dataStr);
      setUserName(data.userName || "");
      setShiftStart(data.shiftStart ? new Date(data.shiftStart) : null);
      setShiftEnd(data.shiftEnd ? new Date(data.shiftEnd) : null);
      setTotalSales(data.totalSales || 0);
      setOrdersCount(data.ordersCount || 0);
      setOstatníPolozky(data.ostatníPolozky || položky.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}));
      setMenu(data.menu || []);
      setSleva(data.sleva || "");
      setZaplaceno(data.zaplaceno || "");
      setVýsledek(data.výsledek || null);
    }
  }, []);

  // Uložit všechna potřebná data do storage
  const saveShiftData = (updates = {}) => {
    const data = {
      userName,
      shiftStart,
      shiftEnd,
      totalSales,
      ordersCount,
      ostatníPolozky,
      menu,
      sleva,
      zaplaceno,
      výsledek,
      ...updates,
    };
    localStorage.setItem("shiftData", JSON.stringify(data));
    if (updates.userName !== undefined) setUserName(updates.userName);
    if (updates.shiftStart !== undefined)
      setShiftStart(updates.shiftStart ? new Date(updates.shiftStart) : null);
    if (updates.shiftEnd !== undefined)
      setShiftEnd(updates.shiftEnd ? new Date(updates.shiftEnd) : null);
    if (updates.totalSales !== undefined) setTotalSales(updates.totalSales);
    if (updates.ordersCount !== undefined) setOrdersCount(updates.ordersCount);
    if (updates.ostatníPolozky !== undefined) setOstatníPolozky(updates.ostatníPolozky);
    if (updates.menu !== undefined) setMenu(updates.menu);
    if (updates.sleva !== undefined) setSleva(updates.sleva);
    if (updates.zaplaceno !== undefined) setZaplaceno(updates.zaplaceno);
    if (updates.výsledek !== undefined) setVýsledek(updates.výsledek);
  };

  // Start směny
  const startShift = () => {
    if (!userName.trim()) {
      alert("Zadej prosím jméno");
      return;
    }
    const now = new Date().toISOString();
    saveShiftData({
      userName: userName.trim(),
      shiftStart: now,
      shiftEnd: null,
      totalSales: 0,
      ordersCount: 0,
      ostatníPolozky: položky.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}),
      menu: [],
      sleva: "",
      zaplaceno: "",
      výsledek: null,
    });
  };

  // Ukončení směny
  const endShift = () => {
    const now = new Date().toISOString();
    saveShiftData({ shiftEnd: now });
  };

  // Přidání prodeje do směny (volat po každé objednávce)
  const addSale = (amount) => {
    saveShiftData({
      totalSales: totalSales + amount,
      ordersCount: ordersCount + 1,
    });
  };

  // Změna množství ostatních položek
  const změňMnožství = (položka, hodnota) => {
    const nováPoložka = { ...ostatníPolozky, [položka]: Math.max(0, Number(hodnota)) };
    saveShiftData({ ostatníPolozky: nováPoložka });
  };

  // Přidat nové menu
  const přidejMenu = () => {
    const nováMenu = [...menu, novéMenu];
    saveShiftData({ menu: nováMenu });
    setNovéMenu({
      burger: "Cheseburger",
      pití: "Voda",
      hranolky: "Fries",
    });
  };

  // Smazat menu podle indexu
  const smažMenu = (index) => {
    const nováMenu = menu.filter((_, i) => i !== index);
    saveShiftData({ menu: nováMenu });
  };

  // Výpočet objednávky přes API
  const spočti = async () => {
    setChyba(null);
    setVýsledek(null);
    try {
      const res = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ostatní_polozky: ostatníPolozky,
          menu,
          sleva,
          zaplaceno,
        }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setChyba(error || "Nepodařilo se spočítat.");
        return;
      }
      const data = await res.json();
      setVýsledek(data);
      // Přidáme do celkového prodeje částku po slevě a zvýšíme počet objednávek
      addSale(data.cena_po_sleve);
    } catch (e) {
      setChyba("Chyba serveru.");
    }
  };

  // Formát času a délky směny
  const formatDuration = (start, end) => {
    if (!start || !end) return "";
    const diffMs = end - start;
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  // --- Render ---

  // Pokud není směna spuštěná, zobraz formulář startu
  if (!shiftStart) {
    return (
      <div style={{ maxWidth: 400, margin: "auto", padding: 20, fontFamily: "Arial" }}>
        <h2>Zapni směnu</h2>
        <input
          type="text"
          placeholder="Zadej své jméno"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ width: "100%", padding: 8, fontSize: 16 }}
        />
        <button
          onClick={startShift}
          style={{ marginTop: 10, fontSize: 16, padding: "10px 20px", cursor: "pointer" }}
        >
          Start směny
        </button>
      </div>
    );
  }

  // Pokud je směna ukončená, zobraz přehled
  if (shiftEnd) {
    const datum = shiftStart.toLocaleDateString("cs-CZ"); // formát dd.mm.yyyy
    const od = shiftStart.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" }); // hh:mm
    const doCas = shiftEnd.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });

    const diffMs = shiftEnd - shiftStart;
    const diffMin = Math.round(diffMs / 60000);
    return (
      <div
        style={{
          maxWidth: 400,
          margin: "auto",
          padding: 20,
          fontFamily: "Arial, monospace",
          whiteSpace: "pre-line",
          lineHeight: 1.6,
          backgroundColor: "#111",
          color: "#FFD633",
          borderRadius: 8,
          border: "2px solid #FF7F11",
          textAlign: "left",
        }}
      >
        <h2>Souhrn směny</h2>
        <p>👤 Jméno: {userName}</p>
        <p>📆 Datum: {shiftStart.toLocaleDateString()}</p>
        <p>⏰ Od: {shiftStart.toLocaleTimeString()}</p>
        <p>⏰ Do: {shiftEnd.toLocaleTimeString()}</p>
        <p>⏳ Délka směny: {formatDuration(shiftStart, shiftEnd)}</p>
        <p>💰 Prodej za směnu celkový: {totalSales.toFixed(2)} $</p>
        <p>📊 Celková aktivita: {diffMin} min</p>

        <button
          style={{
            marginTop: 20,
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#FFD633",
            color: "#111",
            fontWeight: "bold",
            borderRadius: 6,
          }}
          onClick={() =>
            saveShiftData({
              shiftStart: null,
              shiftEnd: null,
              totalSales: 0,
              ordersCount: 0,
              userName: "",
              ostatníPolozky: položky.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}),
              menu: [],
              sleva: "",
              zaplaceno: "",
              výsledek: null,
            })
          }
        >
          Začít novou směnu
        </button>
      </div>
    );
  }

  // --- Během směny: zobraz pokladnu + ovládání ---

  // Mapování cen pro UI
  const ceny = {
    Cheseburger: 700,
    "Steak House Burger": 900,
    "Big King": 1000,
    "Double Cheseburger": 1200,
    "Big King XXL": 1500,
    Fries: 200,
    Pití: 5,
    Menu: 2000,
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2>Směna spuštěna</h2>
      <p>
        Přihlášen: <b>{userName}</b> od {shiftStart.toLocaleTimeString()}
      </p>
      <button
        onClick={endShift}
        style={{
          marginBottom: 20,
          padding: "10px 20px",
          cursor: "pointer",
          backgroundColor: "#FF7F11",
          color: "white",
          borderRadius: 6,
          fontWeight: "bold",
        }}
      >
        Ukončit směnu
      </button>

      <h2>Ostatní položky</h2>
      <table style={{ width: "100%", marginBottom: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Položka</th>
            <th>Cena ($)</th>
            <th style={{ width: 150 }}>Množství</th>
          </tr>
        </thead>
        <tbody>
          {položky.map((položka) => (
            <tr key={položka}>
              <td>{položka}</td>
              <td>{ceny[položka]}</td>
              <td>
                <button
                  onClick={() => změňMnožství(položka, ostatníPolozky[položka] - 1)}
                  disabled={ostatníPolozky[položka] === 0}
                  style={{ marginRight: 10 }}
                >
                  –
                </button>
                <input
                  type="number"
                  min="0"
                  value={ostatníPolozky[položka]}
                  onChange={(e) => změňMnožství(položka, e.target.value)}
                  style={{ width: 50, textAlign: "center" }}
                />
                <button onClick={() => změňMnožství(položka, ostatníPolozky[položka] + 1)} style={{ marginLeft: 10 }}>
                  +
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Přidat Menu</h2>
      <div
        style={{
          backgroundColor: "#222",
          padding: 10,
          borderRadius: 5,
          color: "#f5f5f5",
          marginBottom: 20,
          maxWidth: 400,
        }}
      >
        <label>
          Burger:{" "}
          <select
            value={novéMenu.burger}
            onChange={(e) => setNovéMenu((old) => ({ ...old, burger: e.target.value }))}
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
            value={novéMenu.pití}
            onChange={(e) => setNovéMenu((old) => ({ ...old, pití: e.target.value }))}
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
            value={novéMenu.hranolky}
            onChange={(e) => setNovéMenu((old) => ({ ...old, hranolky: e.target.value }))}
          >
            {hranolky.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <br />
        <button onClick={přidejMenu} style={{ marginTop: 10 }}>
          Přidat Menu
        </button>
      </div>

      <h2>Aktuální Menu</h2>
      {menu.length === 0 && <p>Žádné menu není přidáno.</p>}
      {menu.map((m, i) => (
        <div
          key={i}
          style={{ backgroundColor: "#444", padding: 10, borderRadius: 5, color: "#eee", marginBottom: 5, maxWidth: 400 }}
        >
          <b>Menu #{i + 1}:</b> {m.burger}, {m.pití},{" "}
          {m.hranolky === "Není" ? "bez hranolek" : m.hranolky}
          <button
            onClick={() => smažMenu(i)}
            style={{ marginLeft: 20, cursor: "pointer", color: "red" }}
          >
            Smazat
          </button>
        </div>
      ))}

      <div>
        <label>
          Sleva %:{" "}
          <input
            type="number"
            min="0"
            step="0.01"
            value={sleva}
            onChange={(e) => setSleva(e.target.value)}
            style={{ width: 100, marginRight: 20 }}
          />
        </label>

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
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          marginTop: 20,
          fontWeight: "bold",
          backgroundColor: "#FF7F11",
          color: "white",
          borderRadius: 5,
        }}
      >
        Spočítat
      </button>

      {chyba && <p style={{ color: "red", marginTop: 10 }}>{chyba}</p>}

      {výsledek && (
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", marginTop: 30 }}>
          <h2>Výsledek objednávky</h2>

          {Object.entries(ostatníPolozky)
            .filter(([_, qty]) => qty > 0)
            .map(([p, q]) => `${q}x ..... ${p}`)
            .join("\n")}

          {menu.length > 0 &&
            "\n" +
              menu
                .map(
                  (m, i) =>
                    `${i + 1}x ..... Menu (${m.burger}, ${m.pití}, ${
                      m.hranolky === "Není"
                        ? "bez hranolek"
                        : m.hranolky
                    })`
                )
                .join("\n")}

          {`\n\nCelkem: ${výsledek.cena_po_sleve} $`}
          {výsledek.slevaProcenta > 0
            ? ` (sleva ${výsledek.slevaProcenta} %)\n`
            : "\n"}

          {výsledek.zaplaceno !== null && (
            <>
              {`Zaplaceno: ${výsledek.zaplaceno} $\n`}
              {`Vráceno: ${
                výsleděk.vraceno >= 0
                  ? výsleděk.vraceno.toFixed(2)
                  : "Chybí platba"
              } $`}
            </>
          )}
        </div>
      )}
      <hr style={{ margin: "40px 0" }} />
      <div>
        <h3>Ceník</h3>
        <ul style={{ maxWidth: 400 }}>
          {Object.entries(ceny).map(([key, val]) => (
            <li key={key}>
              {key} - {val} $
            </li>
          ))}
          <li>Menu = burger + pití + hranolky - 2000 $</li>
        </ul>
      </div>
    </div>
  );
}