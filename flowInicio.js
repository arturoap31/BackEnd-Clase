const { addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const { startInactividad, resetInactividad, stopInactividad } = require('../timeoff.js')

//NUEVAS RUTAS
const { flowContraPapeleta } = require('./ContraPapeleta/inicio.js')
const { flowEliminaAntecedentes } = require('./EliminaAntecedentes/inicio.js')
const { flowDespidoArbitrario } = require('./DespidoArbitrario/inicio.js')
const { flowDefensaLegal } = require('./DefensaLegal/inicio.js')

const path = require('path');
const rutaImg = path.join(__dirname, '..', '1. Img', 'LOGO1.png');
const { bdConsulta } = require('../3. Bd/save.js')

const flujoFinal = addKeyword(EVENTS.ACTION).addAnswer('Se canceló por inactividad')

const flowCancelar = addKeyword('C911', { sensitive: true })
    .addAction(null, async (ctx, { endFlow }) => {
        stopInactividad(ctx);
        return endFlow({ body: '_Enviame un *AUDIO* explicandome tu situación_' })
    })

const flowConsultaNueva = addKeyword('NUEVA CONSULTA', { sensitive: true })
    .addAction(null, async (ctx, { gotoFlow, provider }) => {

        startInactividad(ctx, gotoFlow, process.env.TIMEOFF); // ⬅️⬅️⬅️  INICIAMOS LA CUENTA ATRÁS PARA ESTE USUARIO

        console.log('🚩Flujo Nueva Consulta🚩') // CONTROL DE FLUJO

        const message = [
            '_Por favor selecciona una opción:_\n',
            '_1️⃣ Contra Papeletas_\n',
            '_2️⃣ Elimina Antecedentes_\n',
            '_3️⃣ Despido Arbitrario_\n',
            '_4️⃣ Defensa Legal_\n'
            //'_5️⃣ Alimentos 👨‍👨‍👦_\n',
            // '_Si es una *EMERGENCIA LEGAL* escribe *C911*._'
        ].join('\n'); // Unir las líneas con saltos de línea

        await provider.sendImage(ctx.from + '@c.us', rutaImg, message)
        // el número de telefono se envía en este formato 12345678901@s.whatsapp.net
        return gotoFlow(flowInicio)
    })

const flowInicio = addKeyword(['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'buenos días'])

    .addAction(async (ctx, { gotoFlow }) => {
        startInactividad(ctx, gotoFlow, process.env.TIMEOFF); // ⬅️⬅️⬅️  INICIAMOS LA CUENTA ATRÁS PARA ESTE USUARIO
    })


    .addAction(null, async (ctx, { endFlow, flowDynamic, state }) => {
        //console.log(ctx)

        const bdRegistro = await bdConsulta(ctx.from)
        const myState = state?.getMyState()
        await state.update({ botOn: 'true' })

        if (myState && myState.botOn === 'true') {
            // Si botOn es 'true', cancela el flujo.
            return endFlow();
        }

        if (bdRegistro !== 'Registrar') {
            if (ctx.body.toUpperCase() !== 'NUEVA CONSULTA') {
                await flowDynamic([{ body: `_*${bdRegistro}*, En un momento te atiendo_` }])
                await state.update({ botOn: 'true' })
                return endFlow()
            }
        }
    })

    .addAction(null, async (ctx, { provider, gotoFlow }) => {
        console.log('🚩Flujo Inicio🚩') // CONTROL DE FLUJO
        
        const message = [
            '_Por favor selecciona una opción:_\n',
            '_1️⃣ Contra Papeletas_\n',
            '_2️⃣ Elimina Antecedentes_\n',
            '_3️⃣ Despido Arbitrario_\n',
            '_4️⃣ Defensa Legal_\n'
            //'_5️⃣ Alimentos 👨‍👨‍👦_\n',
            // '_Si es una *EMERGENCIA LEGAL* escribe *C911*._'
        ].join('\n'); // Unir las líneas con saltos de línea

        await provider.sendImage(ctx.from + '@c.us', rutaImg, message)
        // el número de telefono se envía en este formato 12345678901@s.whatsapp.net

    })

    .addAction({
        capture: true
    }, async (ctx, { flowDynamic, gotoFlow, fallBack, state, endFlow }) => {


        await state.update({ numerotelefono: ctx.from, pushname: ctx.pushName, verifiedbizname: ctx.verifiedBizName })
        const message = '_Respuesta incorrecta_\n_Para cancelar el *ROBOT* escribe: *C911*_'

        //FLOW DE ATENCION

        if (ctx.body.toUpperCase() === '1') { // CONTRA PAPELETA
            console.log('🚩Flujo Inicio | OPCION 1🚩') // CONTROL DE FLUJO
            resetInactividad(ctx, gotoFlow, process.env.TIMEOFF)
            return gotoFlow(flowContraPapeleta)

        } else if (ctx.body.toUpperCase() === '2') { // ELIMINA ANTECEDENTES
            console.log('🚩Flujo Inicio | OPCION 2🚩') // CONTROL DE FLUJO
            resetInactividad(ctx, gotoFlow, process.env.TIMEOFF)
            return gotoFlow(flowEliminaAntecedentes)

        } else if (ctx.body.toUpperCase() === '3') { // DESPIDO ARBITRARIO
            console.log('🚩Flujo Inicio | OPCION 3🚩') // CONTROL DE FLUJO
            resetInactividad(ctx, gotoFlow, process.env.TIMEOFF)
            return gotoFlow(flowDespidoArbitrario)

        } else if (ctx.body.toUpperCase() === '4') { // DEFENSA LEGAL
            console.log('🚩Flujo Inicio | OPCION 4🚩') // CONTROL DE FLUJO
            resetInactividad(ctx, gotoFlow, process.env.TIMEOFF)
            return gotoFlow(flowDefensaLegal)

        } else if (ctx.body.toUpperCase() === 'C911') {
            console.log('🚩Flujo Inicio | OPCION C911🚩') // CONTROL DE FLUJO
            resetInactividad(ctx, gotoFlow, process.env.TIMEOFF)
            return gotoFlow(flowCancelar)

        } else {
            const myState = await state.getMyState(); // Asegúrate de usar await aquí

            // Verificar si IntentosError está definido y es un número
            if (typeof myState.IntentosError !== 'number' || isNaN(myState.IntentosError)) {
                myState.IntentosError = 0; // Inicializar a 0 si no está definido o no es un número
            }

            if (myState.IntentosError >= 1) {
                myState.IntentosError = 0;
                stopInactividad(ctx);
                return endFlow('_Enviame un *AUDIO* explicandome tu situación_');
            } else {
                const nuevosIntentosError = myState.IntentosError + 1;
                await state.update({ IntentosError: nuevosIntentosError }); // Sumar correctamente IntentosError
                console.log('IntentosError actual:', nuevosIntentosError); // Mostrar el valor actualizado
                return fallBack(message);
            }
        }
    })


module.exports = {
    flowInicio,
    flowCancelar,
    flowConsultaNueva,
    flujoFinal,
};