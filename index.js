
const fs = require('fs');

const points = [
  { x: 1.0, y: 2.0, z: 3.0 },
  { x: 4.0, y: 5.0, z: 6.0 },
  { x: 7.0, y: 8.0, z: 9.0 },
];

const filePath = 'output.xyz';

const data = points.map(point => `${point.x} ${point.y} ${point.z}`).join('\n');

fs.writeFileSync(filePath, data, 'utf-8');

console.log(`Arquivo XYZ gerado com sucesso em ${filePath}`);

// Função para converter ângulo e medida em coordenadas XYZ
function lidarToXYZ(angleDegrees, distance) {
  const angleRadians = (angleDegrees * Math.PI) / 180.0;
  const x = distance * Math.cos(angleRadians);
  const y = distance * Math.sin(angleRadians);
  const z = 0; // Se você souber a altura do sensor ou tiver informações adicionais, ajuste isso

  return { x, y, z };
}






const { SerialPort } = require("serialport");
// or
//import { SerialPort } from 'serialport'

let valores = {ultimosValores: {}, mediaValores: {}, desvioPadrao: {}, xyz: {}}
const tol = 0.03

// SerialPort.list().then((res) => console.log("Lista de portas ", res));

// Create a port
const port = new SerialPort({
  path: "COM10",
  baudRate: 230400,
});

// Read data that is available but keep the stream in "paused mode"
port.on("readable", function () {
  //   console.log("Data:", port.read());
  const data = port.read(); // Recebe os dados como um Buffer

  // Verifica se há dados
  if (data && data.length >= 8) {
    // Certifique-se de que há pelo menos 8 bytes disponíveis
    const agrupaBytes = (high, low) => {
      // Extraindo os bytes High e Low
      const highByte = data.readUInt8(high); // Byte 6
      const lowByte = data.readUInt8(low); // Byte 7

      // Combinação dos bytes High e Low
      return (highByte << 8) | lowByte;
    };

    //   console.log("Byte High:", highByte);
    //   console.log("Byte Low:", lowByte);
    //console.log("Start angle: ", data.readUInt8(5));  
    // console.log("End angle: ", data.readUInt8(55));

    //agrupaBytes(7, 8)/100
 
    if (
      data.readUInt8(5) <= 3 && 
    ((agrupaBytes(7, 8)/1000 > valores['mediaValores'][data.readUInt8(5)] * (1 - tol) && 
    agrupaBytes(7, 8)/1000 < valores['mediaValores'][data.readUInt8(5)] * (1 + tol)) ||
    valores['mediaValores'][data.readUInt8(5)] === undefined) 
     ) {
      // console.log("###$#$#$#$#$#$#$$ Angulo: ", data.readUInt8(5))
      // console.log(new Date())
      valores['ultimosValores'][data.readUInt8(5)] = valores['ultimosValores'][data.readUInt8(5)] || []
      valores['ultimosValores'][data.readUInt8(5)].push(agrupaBytes(7, 8)/1000);
      if (valores['ultimosValores'][data.readUInt8(5)].length >= 10) { 
        valores['ultimosValores'][data.readUInt8(5)].shift();
        valores['mediaValores'][data.readUInt8(5)] = calcularMediaSemOutliers(valores['ultimosValores'][data.readUInt8(5)], data.readUInt8(5)); 
      }
    } 

    // console.log(new Date());
    // console.log("Valores combinados:", valores);

  }
});

setInterval(()=>console.log(valores),10000)

// Switches the port into "flowing mode"
// port.on("data", function (data) {
//   //console.log("Data:", data);
// });

// Pipe the data into another stream (like a parser or standard out)
//const lineStream = port.pipe(new Readline())
function calcularMediaSemOutliers(dados, desviosPadraoLimite = 1.8, angulo) {
  // Ordena os dados
  const dadosOrdenados = dados.slice().sort((a, b) => a - b);

  // Calcula a média e o desvio padrão
  const media = calcularMedia(dadosOrdenados);
  const desvioPadrao = calcularDesvioPadrao(dadosOrdenados, media);
  valores['desvioPadrao'][angulo] = desvioPadrao;

  // Filtra os valores que não são considerados outliers
  const dadosFiltrados = dadosOrdenados.filter(valor => {
    const distanciaEmDesviosPadrao = Math.abs(valor - media) / desvioPadrao;
    return distanciaEmDesviosPadrao <= desviosPadraoLimite;
  });

  // Calcula a média dos valores filtrados
  const mediaSemOutliers = calcularMedia(dadosFiltrados);

  return parseFloat(mediaSemOutliers.toFixed(3));
}

function calcularMedia(dados) {
  const soma = dados.reduce((acc, valor) => acc + valor, 0);
  return soma / dados.length;
}

function calcularDesvioPadrao(dados, media) {
  const diferencaQuadrada = dados.map(valor => Math.pow(valor - media, 2));
  const variancia = diferencaQuadrada.reduce((acc, valor) => acc + valor, 0) / dados.length;
  return Math.sqrt(variancia);
}

// Exemplo de uso
const amostra = [12.823, 15.033, 14.321, 13.954, 11.001, 10.777, 16.151, 18.484, 20.220, 25.321];
const mediaSemOutliers = calcularMediaSemOutliers(amostra);
console.log("Média sem outliers:", mediaSemOutliers);


