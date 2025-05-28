// Configuração do Mapa
const mapsConfig = {
    center: [-23.550520, -46.633308], // São Paulo
    zoom: 15,
    maxDistance: 10, // km
    baseTaxaEntrega: 2.00,
    taxaPorKm: 1.50
};

let map, marker;

function initMap() {
    // Inicializa o mapa
    map = L.map('mapa-container').setView(mapsConfig.center, mapsConfig.zoom);

    // Adiciona a camada do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Adiciona marcador
    marker = L.marker(mapsConfig.center, {
        draggable: true
    }).addTo(map);

    // Adiciona campo de busca
    const searchControl = L.Control.geocoder({
        defaultMarkGeocode: false
    }).addTo(map);

    // Eventos
    marker.on('dragend', onMarkerMoved);
    
    searchControl.on('markgeocode', function(e) {
        const latlng = e.geocode.center;
        marker.setLatLng(latlng);
        map.setView(latlng, 17);
        onPlaceChanged(e.geocode);
    });

    // Tenta obter localização atual
    map.locate({setView: true, maxZoom: 16});
    
    map.on('locationfound', function(e) {
        marker.setLatLng(e.latlng);
        calcularDistanciaETaxa(e.latlng);
    });
}

function onPlaceChanged(result) {
    if (!result) return;

    const endereco = {
        rua: result.name,
        numero: '',
        bairro: result.properties?.suburb || ''
    };

    preencherEndereco(endereco);
    calcularDistanciaETaxa(result.center);
}

function onMarkerMoved(e) {
    const latlng = marker.getLatLng();
    buscarEndereco(latlng);
    calcularDistanciaETaxa(latlng);
}

function preencherEndereco(endereco) {
    document.getElementById('rua').value = endereco.rua || '';
    document.getElementById('numero').value = endereco.numero || '';
    document.getElementById('bairro').value = endereco.bairro || '';
}

function buscarEndereco(latlng) {
    // Usando Nominatim para geocodificação reversa
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
        .then(response => response.json())
        .then(data => {
            const endereco = {
                rua: data.address.road || '',
                numero: data.address.house_number || '',
                bairro: data.address.suburb || data.address.neighbourhood || ''
            };
            preencherEndereco(endereco);
        })
        .catch(error => console.error('Erro ao buscar endereço:', error));
}

function calcularDistanciaETaxa(destino) {
    // Calcula distância usando a fórmula de Haversine
    const origem = L.latLng(mapsConfig.center);
    const dest = L.latLng(destino);
    const distanciaKm = origem.distanceTo(dest) / 1000;
    
    const taxa = calcularTaxaEntrega(distanciaKm);
    if (taxa !== null) {
        document.getElementById('taxa-entrega').textContent = 
            `R$ ${taxa.toFixed(2)}`;
        
        // Atualiza o resumo do carrinho
        if (typeof atualizarResumo === 'function') {
            atualizarResumo();
        }
    } else {
        document.getElementById('taxa-entrega').textContent = 'Fora da área de entrega';
    }
}

function calcularTaxaEntrega(distancia) {
    if (distancia <= mapsConfig.maxDistance) {
        return Math.max(
            mapsConfig.baseTaxaEntrega,
            mapsConfig.baseTaxaEntrega + (distancia - 3) * mapsConfig.taxaPorKm
        );
    }
    return null; // Fora da área de entrega
}

// Inicializa quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', initMap); 