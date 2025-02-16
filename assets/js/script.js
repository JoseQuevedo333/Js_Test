let tipoCambioconversor = {};
let historicosconversor = {};

async function jsonconversor() {
  try {
    const fetchconversor = await fetch("https://mindicador.cl/api/");
    if (!fetchconversor.ok) throw new Error("No se puede obtener los datos");

    const dataconversor = await fetchconversor.json();

    tipoCambioconversor.dolar = dataconversor.dolar.valor;
    tipoCambioconversor.euro = dataconversor.euro.valor;
    tipoCambioconversor.bitcoin = dataconversor.bitcoin.valor;

    console.log("Tipo de cambio conseguido:", tipoCambioconversor);
  } catch (error) {
    document.getElementById("error").textContent =
      "Hubo un error, no se pudo obtener el tipo de cambio.";
    console.error(error);
  }
}

async function prepareconversor(moneda) {
  try {
    const fetchconversor = await fetch(`https://mindicador.cl/api/${moneda}`);
    if (!fetchconversor.ok) throw new Error("No se puede obtener los datos");

    const dataconversor = await fetchconversor.json();
    historicosconversor[moneda] = dataconversor.serie.slice(0, 10).reverse();

    console.log(`Históricos de ${moneda}:`, historicosconversor[moneda]);
    graficoconversor(moneda);
  } catch (error) {
    document.getElementById("error").textContent =
      "Hubo un error, no se pudo obtener los datos históricos.";
    console.error(error);
  }
}

async function renderconversor() {
  const cantidad = parseFloat(document.getElementById("inputconversor").value);
  const moneda = document.getElementById("selectconversor").value;
  const resultadoconversor = document.getElementById("resultado");
  const errorconversor = document.getElementById("error");

  errorconversor.textContent = "";
  resultadoconversor.textContent = "";

  if (isNaN(cantidad) || cantidad <= 0) {
    errorconversor.textContent = "Intenta agregando un valor válido.";
    return;
  }

  const tipoDeCambioSeleccionado = tipoCambioconversor[moneda];

  if (!tipoDeCambioSeleccionado) {
    errorconversor.textContent =
      "No encontramos el tipo de cambio seleccionado.";
    return;
  }

  const resultado = cantidad / tipoDeCambioSeleccionado;
  resultadoconversor.textContent = `Resultado: ${resultado.toFixed(
    2
  )} ${moneda.toUpperCase()}`;

  prepareconversor(moneda);
}

function graficoconversor(moneda) {
  const ctx = document.getElementById("graficoconversor").getContext("2d");
  const dataconversor = historicosconversor[moneda];

  if (!dataconversor || dataconversor.length === 0) {
    console.warn(`No hay datos históricos para ${moneda}`);
    return;
  }

  const etiquetas = dataconversor.map((d) =>
    new Date(d.fecha).toLocaleDateString()
  );
  const valores = dataconversor.map((d) => d.valor);

  if (window.miGrafico) window.miGrafico.destroy();

  window.miGrafico = new Chart(ctx, {
    type: "line",
    data: {
      labels: etiquetas,
      datasets: [
        {
          label: `Histórico ${moneda.toUpperCase()} (Últimos 10 días)`,
          data: valores,
          borderColor: "green",
          backgroundColor: "rgba(16, 187, 44, 0.2)",
          fill: true,
        },
      ],
    },
  });
}

jsonconversor();
