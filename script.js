let velocidade = 0;
let altitude = 0;
let flaps = 0;
let direcao = "Norte";
let tremPouso = "Baixado";
let pontosSelecionados = [];
let linhaRota;
let combustivel = 100; // Combustível em %

let mapa = L.map('mapa').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapa);

const paises = [
    { nome: "Estados Unidos", lat: 37.0902, lng: -95.7129 },
    { nome: "China", lat: 35.8617, lng: 104.1954 },
    { nome: "Japão", lat: 36.2048, lng: 138.2529 },
    { nome: "Alemanha", lat: 51.1657, lng: 10.4515 },
    { nome: "Reino Unido", lat: 55.3781, lng: -3.4360 },
    { nome: "Índia", lat: 20.5937, lng: 78.9629 },
    { nome: "França", lat: 46.6034, lng: 1.8883 },
    { nome: "Brasil", lat: -14.2350, lng: -51.9253 },
    { nome: "Itália", lat: 41.8719, lng: 12.5674 },
    { nome: "Canadá", lat: 56.1304, lng: -106.3468 }
];

// Adiciona opções aos selects
const selectOrigem = document.getElementById("origem");
const selectDestino = document.getElementById("destino");
const limparPontosBtn = document.getElementById("limparPontos");
const distanciaInfo = document.getElementById("distancia-info");

paises.forEach(pais => {
    let optionOrigem = document.createElement("option");
    let optionDestino = document.createElement("option");

    optionOrigem.value = JSON.stringify({lat: pais.lat, lng: pais.lng});
    optionDestino.value = JSON.stringify({lat: pais.lat, lng: pais.lng});

    optionOrigem.textContent = pais.nome;
    optionDestino.textContent = pais.nome;

    selectOrigem.appendChild(optionOrigem);
    selectDestino.appendChild(optionDestino);
});

let marcadorOrigem = null;
let marcadorDestino = null;

// Função para adicionar marcador no mapa
function adicionarMarcador(select, tipo) {
    let valor = select.value ? JSON.parse(select.value) : null;

    if (valor) {
        if (tipo === "origem") {
            if (marcadorOrigem) mapa.removeLayer(marcadorOrigem);
            marcadorOrigem = L.marker([valor.lat, valor.lng]).addTo(mapa)
                .bindPopup(`Origem: ${select.options[select.selectedIndex].text}`).openPopup();
        } else {
            if (marcadorDestino) mapa.removeLayer(marcadorDestino);
            marcadorDestino = L.marker([valor.lat, valor.lng]).addTo(mapa)
                .bindPopup(`Destino: ${select.options[select.selectedIndex].text}`).openPopup();
        }
        mapa.setView([valor.lat, valor.lng], 4);
    }
}

// Eventos para os selects
selectOrigem.addEventListener("change", () => adicionarMarcador(selectOrigem, "origem"));
selectDestino.addEventListener("change", () => adicionarMarcador(selectDestino, "destino"));

// Função para remover todos os marcadores
limparPontosBtn.addEventListener("click", () => {
    if (marcadorOrigem) {
        mapa.removeLayer(marcadorOrigem);
        marcadorOrigem = null;
    }
    if (marcadorDestino) {
        mapa.removeLayer(marcadorDestino);
        marcadorDestino = null;
    }
});

// Controle de Velocidade
document.getElementById("aumentarVel").addEventListener("click", function() {
    velocidade += 50;
    atualizarInstrumentos();
});

document.getElementById("diminuirVel").addEventListener("click", function() {
    if (velocidade > 0) velocidade -= 50;
    atualizarInstrumentos();
});

// Controle de Altitude
document.getElementById("subir").addEventListener("click", function() {
    if (velocidade >= 200) {
        altitude += 500;
        atualizarInstrumentos();
    }
});

document.getElementById("descer").addEventListener("click", function() {
    if (altitude > 0) {
        altitude -= 500;
        atualizarInstrumentos();
    }
});

// Controle de Flaps
document.getElementById("flaps").addEventListener("click", function() {
    if (flaps < 40) flaps += 10;
    else flaps = 0;
    atualizarInstrumentos();
});

// Controle de Direção
document.getElementById("direcaoEsq").addEventListener("click", function() {
    direcao = "Oeste";
    atualizarInstrumentos();
});

document.getElementById("direcaoDir").addEventListener("click", function() {
    direcao = "Leste";
    atualizarInstrumentos();
});

// Controle do Trem de Pouso
document.getElementById("tremPouso").addEventListener("click", function() {
    tremPouso = tremPouso === "Baixado" ? "Recolhido" : "Baixado";
    atualizarInstrumentos();
});

// Atualiza os instrumentos
function atualizarInstrumentos() {
    document.getElementById("velocidade").innerText = velocidade + " km/h";
    document.getElementById("altitude").innerText = altitude + " m";
    document.getElementById("flapStatus").innerText = flaps + "%";
    document.getElementById("direcao").innerText = direcao;
    document.getElementById("tremStatus").innerText = tremPouso;
    document.getElementById("combustivel").innerText = combustivel.toFixed(2) + "%";
}
// Função para calcular a distância entre dois pontos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Função para atualizar a linha entre origem e destino
function atualizarRota() {
    if (marcadorOrigem && marcadorDestino) {
        const latlngs = [marcadorOrigem.getLatLng(), marcadorDestino.getLatLng()];
        if (linhaRota) mapa.removeLayer(linhaRota);
        linhaRota = L.polyline(latlngs, {color: 'red'}).addTo(mapa);
        
        const distancia = calcularDistancia(latlngs[0].lat, latlngs[0].lng, latlngs[1].lat, latlngs[1].lng);
        const tempoVoo = (distancia / (velocidade || 800)).toFixed(2);
        distanciaInfo.innerHTML = `Distância: ${distancia.toFixed(2)} km | Tempo estimado: ${tempoVoo} h`;
    }
}

// Função para definir um marcador ao clicar no mapa
function definirMarcador(e) {
    if (!marcadorOrigem) {
        marcadorOrigem = L.marker(e.latlng).addTo(mapa).bindPopup("Origem").openPopup();
    } else if (!marcadorDestino) {
        marcadorDestino = L.marker(e.latlng).addTo(mapa).bindPopup("Destino").openPopup();
        atualizarRota();
    }
}
mapa.on('click', definirMarcador);

// Evento para limpar pontos
limparPontosBtn.addEventListener("click", () => {
    if (marcadorOrigem) mapa.removeLayer(marcadorOrigem);
    if (marcadorDestino) mapa.removeLayer(marcadorDestino);
    if (linhaRota) mapa.removeLayer(linhaRota);
    marcadorOrigem = null;
    marcadorDestino = null;
    linhaRota = null;
    distanciaInfo.innerHTML = "";
});

// Controle de velocidade
document.getElementById("aumentarVel").addEventListener("click", function() {
    velocidade += 50;
    atualizarInstrumentos();
    atualizarRota();
});

document.getElementById("diminuirVel").addEventListener("click", function() {
    if (velocidade > 0) velocidade -= 50;
    atualizarInstrumentos();
    atualizarRota();
});

// Atualiza os instrumentos
function atualizarInstrumentos() {
    document.getElementById("velocidade").innerText = velocidade + " km/h";
    document.getElementById("altitude").innerText = altitude + " m";
    document.getElementById("flapStatus").innerText = flaps + "%";
    document.getElementById("direcao").innerText = direcao;
    document.getElementById("tremStatus").innerText = tremPouso;
    document.getElementById("combustivel").innerText = combustivel.toFixed(2) + "%";
} 

// Mantém todas as funcionalidades como altitude, flaps, direção, trem de pouso e combustível funcionando corretamente.

