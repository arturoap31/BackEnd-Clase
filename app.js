const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

// - Invocamosa dotenv
const dotenv = require('dotenv')
dotenv.config({ path: './.env' })

// BASE DE DATOS
const bd = require('./3. Bd/bd.js')
const { phoneBlackList } = require('./3. Bd/save.js')

const { flowInactividad, startInactividad, resetInactividad, stopInactividad
} = require('./timeoff.js');

//CONEXION A FLOW
//Inicio
const { flowInicio, flowCancelar, flowConsultaNueva, flujoFinal } = require('./2. Flow/flowInicio')
//CONTRA PAPELETA
const { flowContraPapeleta } = require('./2. Flow/ContraPapeleta/inicio.js')
// ELIMINA ANTECEDENTES
const { flowEliminaAntecedentes } = require('./2. Flow/EliminaAntecedentes/inicio.js')
const { flowIniciarBusqueda } = require('./2. Flow/EliminaAntecedentes/busqueda.js')
// DESPIDO ARBITRARIO
const { flowDespidoArbitrario } = require('./2. Flow/DespidoArbitrario/inicio.js')
const { flowAgendarConsulta } = require('./2. Flow/DespidoArbitrario/consulta.js')
// DEFENSA LEGAL
const { flowDefensaLegal } = require('./2. Flow/DefensaLegal/inicio.js')
const { flowAgendarConsulta1 } = require('./2. Flow/DefensaLegal/consulta.js')



//CONEXION A FLOW

const main = async () => {

        const BOTNAME = 'AsesoriaBot'
        const phoneBlackListResult = await phoneBlackList()
        //console.log(phoneBlackListResult)


        const adapterDB = new MockAdapter()
        const adapterFlow = createFlow([

                //Inicio
                flowInicio,
                flowCancelar,
                flowConsultaNueva,
                flujoFinal,
                //CONTRA PAPELETA
                flowContraPapeleta,
                // ELIMINA ANTECEDENTES
                flowEliminaAntecedentes,
                flowIniciarBusqueda,
                // DESPIDO ARBITRARIO
                flowDespidoArbitrario,
                flowAgendarConsulta,
                // DEFENSA LEGAL
                flowDefensaLegal,
                flowAgendarConsulta1,
                // TIMER OFF PARA FLUJO
                flowInactividad,
        ])

        const adapterProvider = createProvider(BaileysProvider, { name: BOTNAME })

        createBot({
                flow: adapterFlow,
                provider: adapterProvider,
                database: adapterDB,
        }, {
                blackList: phoneBlackList 
        })

        QRPortalWeb({ name: BOTNAME, port: 4085 })
}

main()