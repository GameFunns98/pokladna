// /pages/api/calc.js

const ceník = {
  "Cheseburger": 700,
  "Steak House Burger": 900,
  "Big King": 1000,
  "Double Cheseburger": 1200,
  "Big King XXL": 1500,
  "Fries": 200,
  "Menu": 2000,
  "Pití": 5,
};

export default function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { ostatní_polozky, menu, sleva, zaplaceno } = req.body;

  if (
    typeof ostatní_polozky !== "object" ||
    !Array.isArray(menu)
  ) {
    return res.status(400).json({ error: "Neplatná data objednávky" });
  }

  let cena_celkem = 0;

  // Cena ostatních položek
  for (const [položka, množství] of Object.entries(ostatní_polozky)) {
    if (!ceník[položka]) return res.status(400).json({ error: `Položka '${položka}' není v ceníku.` });
    if (typeof množství !== "number" || množství < 0) return res.status(400).json({ error: `Neplatné množství u položky ${položka}` });

    cena_celkem += ceník[položka] * množství;
  }

  // Cena za každé menu (fixních 2000$ za kus)
  cena_celkem += menu.length * ceník["Menu"];

  const slevaProcenta = parseFloat(sleva) || 0;
  const cenaPoSleve = cena_celkem * (1 - slevaProcenta / 100);

  const zaplacenoNum = parseFloat(zaplaceno);
  const vraceno = isNaN(zaplacenoNum) ? null : zaplacenoNum - cenaPoSleve;

  res.status(200).json({
    cena_celkem,
    slevaProcenta,
    cena_po_sleve: Number(cenaPoSleve.toFixed(2)),
    zaplaceno: isNaN(zaplacenoNum) ? null : zaplacenoNum,
    vraceno: vraceno !== null ? Number(vraceno.toFixed(2)) : null,
  });
}