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
        console.log(phoneBlackListResult)


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
        ])

        const adapterProvider = createProvider(BaileysProvider, { name: BOTNAME })

        createBot({
                flow: adapterFlow,
                provider: adapterProvider,
                database: adapterDB,
        }, {
                blackList: phoneBlackList /*['51926979141', '51926579334', '51941913682', '51951974922', '51945478396', '51978556763', '51978128448',
                        '51987825449', '51992022336', '51903463635', '51926579334', '51993976074', '51935151446', '51933768341',
                        '51995744801', '51992387031', '51961675975', '51977113408', '51986449570', '51997591041', '51986065673',
                        '51939499998', '51997062642', '51986613563', '51908835285', '51957827659', '51961675975', '51981530505',
                        '51966593494', '51939321420', '51900564384', '51966547719', '51932500744', '51933429003', '51993546153',
                        '51987247407', '51918859776', '51907284394']*/
        })

        QRPortalWeb({ name: BOTNAME, port: 4085 })
}

main()