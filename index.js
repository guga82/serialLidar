const fs = require("fs");


var pointsXYZ = [];
  // { x: 1.0, y: 2.0, z: 3.0 },
  // { x: 4.0, y: 5.0, z: 6.0 },
  // { x: 7.0, y: 8.0, z: 9.0 },
// ];

// setInterval(()=>(console.log(typeof pointsXYZ),console.log(pointsXYZ[pointsXYZ.length-1]),console.log(data(pointsXYZ))),2000)

const filePath = "output.xyz";


var convData = (variavel)=>{

  return (variavel
  .map((point) => `${point.x} ${point.y} ${point.z}`)
  .join("\n"))
}



// fs.writeFileSync(filePath, convData, "utf-8");

setTimeout(() => {

  fs.writeFileSync(filePath, convData(pointsXYZ), "utf-8");

  console.log(`Arquivo XYZ gerado com sucesso em ${filePath}`);
}, 5000);

// Função para converter ângulo e medida em coordenadas XYZ
function lidarToXYZ(angleDegrees, distance) {
  let coordenadas = {}
  const angleRadians = (angleDegrees * Math.PI) / 180.0;
  coordenadas.x = parseInt(distance * Math.cos(angleRadians));
  coordenadas.y = parseInt(distance * Math.sin(angleRadians));
  coordenadas.z = 0; // Se você souber a altura do sensor ou tiver informações adicionais, ajuste isso

  return coordenadas;
}

const { SerialPort } = require("serialport");
// or
//import { SerialPort } from 'serialport'

let valores = {
  ultimosValores: {},
  mediaValores: {},
  desvioPadrao: {},
  xyz: {},
};
const tol = 0.03;

// SerialPort.list().then((res) => console.log("Lista de portas ", res));

// Create a port
const port = new SerialPort({
  path: "COM10",
  baudRate: 230400,
});

// Read data that is available but keep the stream in "paused mode"
port.on("readable", function () {
  //   console.log("Data:", port.read());
  // var data = Buffer.alloc(56);
  // data = port.read()
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
      data.readUInt8(5) <= 360 ||
      true
      
      // ((agrupaBytes(7, 8) / 1000 >
      //   valores["mediaValores"][data.readUInt8(5)] * (1 - tol) &&
      //   agrupaBytes(7, 8) / 1000 <
      //     valores["mediaValores"][data.readUInt8(5)] * (1 + tol)) ||
      //   valores["mediaValores"][data.readUInt8(5)] === undefined)
    ) {
      // console.log("###$#$#$#$#$#$#$$ Angulo: ", data.readUInt8(5))
      // console.log(new Date())
      
      console.log('Byte: ', data )


      const converteAng = (valorHexa) => (parseFloat((parseInt(valorHexa, 16) / 1000).toFixed(1)));

      
      let anguloIni = agrupaBytes(5,6)
      // console.log('angulo ini alto: ', data.readUInt8(5).toString(16) ) valor em hexadecimal
      console.log('angulo ini convertido', anguloIni)
      let tamanhoByte = data.length <= 58 ? data.length : 58
      // console.log('$$$$$$$$$$$$$$$$$ ' , tamanhoByte)
      let anguloFim = data.length > 7 ? agrupaBytes(tamanhoByte - 3,tamanhoByte - 2) : anguloIni
      console.log('angulo fim convertido', anguloFim)

      pointsXYZ.push(lidarToXYZ(anguloIni/100, agrupaBytes(7,8) ))

      let qtdAngulos = (tamanhoByte - 10) / 3

      console.log('Qtd angulos: ', qtdAngulos)
      
      let incAngulo = anguloFim > anguloIni ? (anguloFim - anguloIni) / qtdAngulos : (36000 + anguloFim - anguloIni) / qtdAngulos
      console.log('Distancia: ', agrupaBytes(7, 8))
      console.log( 'incremento do angulo: ',incAngulo)

      for (let index = 1; index < qtdAngulos; index++) {
        let anguloIndex = anguloIni + (index * incAngulo)
        let distIndex = agrupaBytes(7 + (index * 3),8 + (index * 3))
        let coordXYZ = lidarToXYZ(anguloIndex/100, distIndex)      


        distIndex > 0 ? pointsXYZ.push(lidarToXYZ(anguloIndex/100, distIndex)) : '';

        console.log("Angulo: ", anguloIndex/100)
        console.log("Distancia: ", distIndex)
        console.log("Coordenada XYZ: ", coordXYZ)
      }

      // console.log('Angulo Byte baixo: ', data.readUInt8(6))
      // console.log('Angulo Hexa Ini: ', data.readUInt8(5))
      // console.log('Angulo Hexa Fim: ', data.readUInt8(55))
      // console.log('Angulo Inicial: ', converteAng(agrupaBytes(5,6)));
      // // console.log('Angulo Final: ', converteAng(agrupaBytes(55,56)));
      // console.log('Distancia: ', agrupaBytes(7, 8) / 1000)
      // console.log(lidarToXYZ(converteAng(agrupaBytes(5,6)), agrupaBytes(7, 8) / 1000));

      /*
      // console.log('angulo ini alto: ', data.readUInt8(5).toString(16) ) valor em hexadecimal
      let anguloIni = agrupaBytes(5,6)
      console.log('angulo ini convertido', anguloIni)
      let anguloFim = agrupaBytes(55,56)
      let incAngulo = (anguloFim - anguloIni) / 16
      console.log('Distancia: ', agrupaBytes(7, 8) / 1000)
      for (let index = 1; index < 16; index++) {
        let anguloIndex = anguloIni + (index * incAngulo)
        let distIndex = agrupaBytes(7 + (index * 3),8 + (index * 3))
        console.log("Angulo: ", anguloIndex/100)
        console.log("Distancia: ", distIndex/1000)
      }
      console.log('angulo fim convertido', anguloFim)
      console.log('Byte: ', data )
      // console.log('Angulo Byte baixo: ', data.readUInt8(6))
      // console.log('Angulo Hexa Ini: ', data.readUInt8(5))
      // console.log('Angulo Hexa Fim: ', data.readUInt8(55))
      // console.log('Angulo Inicial: ', converteAng(agrupaBytes(5,6)));
      // // console.log('Angulo Final: ', converteAng(agrupaBytes(55,56)));
      // console.log('Distancia: ', agrupaBytes(7, 8) / 1000)
      // console.log(lidarToXYZ(converteAng(agrupaBytes(5,6)), agrupaBytes(7, 8) / 1000));
*/
      // pointsXYZ.push(
      //   lidarToXYZ(converteAng(agrupaBytes(5, 6)), agrupaBytes(7, 8) / 1000)
      // );

      valores["ultimosValores"][data.readUInt8(5)] =
        valores["ultimosValores"][data.readUInt8(5)] || [];
      valores["ultimosValores"][data.readUInt8(5)].push(
        agrupaBytes(7, 8) / 1000
      );
      if (valores["ultimosValores"][data.readUInt8(5)].length >= 10) {
        valores["ultimosValores"][data.readUInt8(5)].shift();
        valores["mediaValores"][data.readUInt8(5)] = calcularMediaSemOutliers(
          valores["ultimosValores"][data.readUInt8(5)],
          data.readUInt8(5)
        );
      }
    }

    // console.log(new Date());
    // console.log("Valores combinados:", valores);
  }
});

// setInterval(() => console.log(valores), 10000);

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
  valores["desvioPadrao"][angulo] = desvioPadrao;

  // Filtra os valores que não são considerados outliers
  const dadosFiltrados = dadosOrdenados.filter((valor) => {
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
  const diferencaQuadrada = dados.map((valor) => Math.pow(valor - media, 2));
  const variancia =
    diferencaQuadrada.reduce((acc, valor) => acc + valor, 0) / dados.length;
  return Math.sqrt(variancia);
}

// Exemplo de uso
const amostra = [
  12.823, 15.033, 14.321, 13.954, 11.001, 10.777, 16.151, 18.484, 20.22, 25.321,
];
const mediaSemOutliers = calcularMediaSemOutliers(amostra);
console.log("Média sem outliers:", mediaSemOutliers);
