require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const POLYGON_RPC_URL = "https://rpc-amoy.polygon.technology/";
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
   // $ truffle test --network <network-name>

  networks: {
    // Configuración para el entorno local (Ganache)
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    // Configuración para la testnet de Polygon (Amoy Testnet)
    mumbai: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, POLYGON_RPC_URL),
      network_id: 80002,     // Chain ID de la Amoy Testnet
      confirmations: 2,      // Número de confirmaciones para esperar después de enviar una transacción
      timeoutBlocks: 200,    // Número de bloques antes de que se agote el tiempo de espera de la transacción
      skipDryRun: true,      // Omitir la ejecución en seco antes de las migraciones
      gasPrice: 25000000000, // Gas Price para las transaccionesC
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.20",      // Fetch exact version from solc-bin (default: truffle's version)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: false,
         runs: 200
       },
      // evmVersion: "byzantium"
      }
    }
  },
};
