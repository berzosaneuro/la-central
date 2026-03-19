'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { claimAndPlay, unregister } from '@/lib/audio-manager'
import { playAudioWithFadeIn, stopVoiceWithFadeOut, createAmbientPad as createSharedAmbientPad, fetchElevenLabsTTS } from '@/lib/audio-utils'
import { trackSessionStart, trackSessionComplete, trackSessionInterrupted } from '@/lib/session-tracking'
import { recordActivity } from '@/lib/streak'
import PremiumLock from '@/components/PremiumLock'
import PremiumBadge from '@/components/PremiumBadge'
import { Brain, Timer, Moon, Crosshair, Play, Pause, Square, Heart, Shield, Wind, Eye, Sun, Zap, Target, Clock, Tag, Leaf, Sparkles, Hand, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Meditation = {
  title: string
  minutes: number
  icon: LucideIcon
  description: string
  free: boolean
  theme: string
  script?: string
}

const meditations: Meditation[] = [
  // ── GRATIS (10) ──────────────────────────────────────────────────

  // Ansiedad
  { title: 'Calma rápida', minutes: 3, icon: Wind, description: 'Respiración guiada para cortar ansiedad en 3 minutos. Activa el nervio vago al instante y frena el sistema simpático.', free: true, theme: 'Ansiedad', script: 'Busca una posición cómoda y cierra los ojos con suavidad.\nVamos a activar el nervio vago para frenar la respuesta de estrés ahora mismo.\nPon una mano sobre el pecho y siente el calor de tu propia mano.\nInhala lentamente por la nariz... uno... dos... tres... cuatro.\nAhora exhala despacio por la boca... uno... dos... tres... cuatro... cinco... seis.\nLa exhalación larga activa el sistema nervioso parasimpático. Tu freno natural.\nDe nuevo. Inhala... uno... dos... tres... cuatro.\nExhala... uno... dos... tres... cuatro... cinco... seis.\nNota cómo el cuerpo empieza a ceder. Los hombros bajan. La mandíbula se afloja.\nOtra respiración. Inhala profundo...\nY exhala, vaciando completamente los pulmones.\nEl cortisol baja. La frecuencia cardíaca se normaliza.\nUna última vez. Inhala...\nY exhala todo, sin prisa.\nQuédate aquí unos segundos. Sintiendo el cuerpo más pesado, más en calma.\nLa ansiedad es química. Y la respiración es el antídoto más rápido que existe.\nCuando estés listo, abre los ojos.' },
  { title: 'Reinicio mental', minutes: 5, icon: Brain, description: 'Limpia el caché mental y empieza de cero. Ideal cuando sientes saturación o bloqueo cognitivo.', free: true, theme: 'Ansiedad', script: 'Cierra los ojos. Pon la espalda recta y las manos sobre los muslos.\nImagina que tu mente es un ordenador con demasiadas pestañas abiertas.\nCorreos pendientes. Conversaciones sin terminar. Preocupaciones del futuro. Recuerdos del pasado.\nTodo eso consume recursos. Todo eso genera ruido.\nAhora vamos a cerrar esas pestañas, una a una.\nToma una respiración profunda. Inhala... y exhala lentamente.\nPiensa en la primera pestaña abierta. Una preocupación, una tarea pendiente.\nObsérvala sin juzgarla. Y visualiza cómo la cierras. Click. Cerrada.\nOtra respiración. Inhala... exhala.\nQué otra pestaña hay. Qué más te ocupa la mente ahora mismo.\nObsérvala. Y ciérrala. Click.\nSigue respirando con calma. Inhala... exhala.\nOtra pestaña más. Obsérvala. Ciérrala.\nNota cómo el espacio mental se despeja.\nComo cuando el ordenador va más fluido después de cerrar programas.\nAhora el escritorio está más limpio.\nHaz una última respiración profunda y consciente.\nCuando abras los ojos, la mente estará más disponible. Lista para empezar de cero.' },

  // Presencia
  { title: 'Micro-presencia', minutes: 3, icon: Crosshair, description: '3 minutos para salir del piloto automático y volver al aquí y ahora. Interrumpe la DMN al instante.', free: true, theme: 'Presencia', script: 'Detente. Exactamente donde estás.\nVamos a interrumpir el piloto automático ahora mismo.\nPrimero, nombra mentalmente cinco cosas que puedes ver ahora mismo.\nNo las evalúes, solo nómbralas. Una... dos... tres... cuatro... cinco.\nAhora cuatro cosas que puedes escuchar en este momento.\nUno... dos... tres... cuatro.\nTres cosas que puedes sentir físicamente.\nEl peso del cuerpo. La temperatura del aire. La textura de lo que tocas.\nDos cosas que puedes oler. O si no hay olor, nota la ausencia.\nY una sola cosa que sientes ahora mismo. Una emoción o sensación interna.\nRespira una vez, profundo.\nAcabas de interrumpir la red neuronal por defecto. El modo rumia.\nEn este momento estás aquí. No en el pasado ni en el futuro.\nAquí es donde sucede la vida.' },

  // Sueño
  { title: 'Pre-sueño', minutes: 5, icon: Moon, description: 'Relajación rápida que prepara el cerebro para el descanso. Reduce el tiempo de latencia del sueño.', free: true, theme: 'Sueño', script: 'Túmbate y cierra los ojos. El día ha terminado. Ya no hay nada que hacer.\nVamos a preparar el sistema nervioso para el descanso.\nRespira profundo. Inhala lentamente... y exhala soltando todo.\nSiente el peso de tu cuerpo sobre la cama. Deja que la gravedad haga el trabajo.\nLleva la atención a los pies. Nota cualquier tensión. Y con la próxima exhalación, déjala ir.\nLas pantorrillas. Nota si hay rigidez. Exhala y relaja.\nLas rodillas, los muslos. Pesados y sueltos.\nLas caderas y la parte baja de la espalda. Esa zona que carga todo el día. Exhala y libera.\nEl abdomen. Que se mueva libremente con la respiración.\nEl pecho. Cada exhalación afloja el pecho un poco más.\nLos hombros. Con la siguiente exhalación, bájalos y suéltalos.\nLos brazos, los codos, las manos. Cada dedo se afloja.\nEl cuello y la mandíbula. Esa tensión silenciosa que acumulamos sin saber.\nLa frente y los ojos. Que descansen completamente.\nTodo el cuerpo, pesado y relajado. Como si te hundieras suavemente.\nLas ondas cerebrales se hacen más lentas. El sueño se acerca.\nSolo soltar.' },

  // Emociones
  { title: 'Autocompasión', minutes: 5, icon: Heart, description: 'Conecta con la bondad hacia ti mismo. Activa la ínsula y reduce el autocrítico interno.', free: true, theme: 'Emociones', script: 'Siéntate cómodamente. Cierra los ojos.\nPon una mano sobre tu corazón. Siente el calor de tu propia mano sobre el pecho.\nNota los latidos. Tu corazón lleva toda tu vida latiendo por ti.\nAhora piensa en algo que te haya costado últimamente.\nNo para analizarlo. Solo para reconocerlo.\nY di mentalmente: esto es difícil. Es normal que esto sea difícil.\nEl sufrimiento es parte de la experiencia humana. No solo para ti. Para todos.\nAhora, como si le hablaras a un buen amigo que estuviera pasando por lo mismo...\nQué le dirías. Con qué palabras le consolarías.\nDite esas mismas palabras a ti mismo. Con la misma amabilidad.\nInhala... sintiendo el calor de tu mano en el pecho.\nExhala... soltando el juicio hacia ti mismo.\nNo tienes que ser perfecto. Solo tienes que seguir siendo humano.\nCon cada respiración, permítete recibir esa amabilidad.\nCuando estés listo, abre los ojos.' },

  // Energía
  { title: 'Despertar consciente', minutes: 5, icon: Sun, description: 'Empieza el día con intención y claridad mental. Define quién quieres ser hoy antes de que el mundo te lo diga.', free: true, theme: 'Energía', script: 'Buenos días. Siéntate con la espalda recta. Cierra los ojos un momento.\nEste es el momento más importante del día.\nAntes de que el mundo te diga quién tienes que ser hoy.\nRespira profundo. Inhala... y exhala.\nPregúntate: cómo quiero estar hoy. No qué quiero hacer. Cómo quiero estar.\nQuieres estar más presente. Más tranquilo. Más conectado.\nElige una cualidad. Y ponle una palabra.\nAhora visualiza tu día con esa cualidad.\nCómo sería tu primera conversación con esa actitud.\nCómo serías en el momento más difícil del día.\nLa corteza prefrontal puede programarse a primera hora para responder diferente durante el día.\nEsto se llama intención priming. Preparar el circuito antes de que lo necesites.\nRespira hondo. Sintiendo esa cualidad ya en tu cuerpo.\nCómo se siente en el pecho. En los hombros.\nHoy tienes la oportunidad de ser quien quieres ser.\nUn momento a la vez. Una respiración a la vez.\nAbre los ojos. El día comienza.' },

  // Respiración
  { title: 'Respiración 4-7-8', minutes: 3, icon: Wind, description: 'Técnica del Dr. Weil: inhala 4s, retén 7s, exhala 8s. Activa el sistema parasimpático en segundos.', free: true, theme: 'Respiración', script: 'Siéntate con la espalda recta. Cierra los ojos.\nVamos a practicar la técnica del Doctor Andrew Weil. Cuatro, siete, ocho.\nPrimero exhala completamente por la boca, vaciando los pulmones.\nAhora cierra la boca y comienza.\nInhala por la nariz. Uno... dos... tres... cuatro.\nRetén la respiración. Uno... dos... tres... cuatro... cinco... seis... siete.\nExhala completamente por la boca. Uno... dos... tres... cuatro... cinco... seis... siete... ocho.\nEso es un ciclo. Vamos con el segundo.\nInhala... uno... dos... tres... cuatro.\nRetén... uno... dos... tres... cuatro... cinco... seis... siete.\nExhala lentamente... uno... dos... tres... cuatro... cinco... seis... siete... ocho.\nEl sistema nervioso parasimpático se activa. El ritmo cardíaco baja.\nTercer ciclo.\nInhala... uno... dos... tres... cuatro.\nRetén... uno... dos... tres... cuatro... cinco... seis... siete.\nExhala... uno... dos... tres... cuatro... cinco... seis... siete... ocho.\nSiente la profunda calma en el cuerpo.\nRepite este ciclo siempre que necesites calmar la mente.' },
  { title: 'Respiración cuadrada', minutes: 5, icon: Shield, description: 'Técnica de los Navy SEALs: 4-4-4-4. Regula el sistema nervioso bajo presión extrema.', free: true, theme: 'Respiración', script: 'Siéntate erguido. Imagina un cuadrado perfecto. Cuatro lados iguales.\nEsta es la técnica de los Navy SEALs para regular el sistema nervioso bajo presión extrema.\nCuatro segundos en cada fase. Cuatro fases.\nExhala todo el aire. Vacía los pulmones completamente.\nPrimer lado: inhala por la nariz. Uno... dos... tres... cuatro.\nSegundo lado: retén con los pulmones llenos. Uno... dos... tres... cuatro.\nTercer lado: exhala lentamente. Uno... dos... tres... cuatro.\nCuarto lado: retén con los pulmones vacíos. Uno... dos... tres... cuatro.\nEso es un cuadrado completo. Vamos con otro.\nInhala... uno... dos... tres... cuatro.\nRetén lleno... uno... dos... tres... cuatro.\nExhala... uno... dos... tres... cuatro.\nRetén vacío... uno... dos... tres... cuatro.\nEl sistema nervioso se regula. La mente se enfoca.\nOtro ciclo más.\nInhala... uno... dos... tres... cuatro.\nRetén... uno... dos... tres... cuatro.\nExhala... uno... dos... tres... cuatro.\nRetén... uno... dos... tres... cuatro.\nPuedes usar esta técnica en cualquier momento de tensión.' },

  // Gratitud
  { title: 'Gratitud express', minutes: 3, icon: Leaf, description: '3 minutos para activar los circuitos de recompensa con gratitud genuina. Cambia el estado cerebral.', free: true, theme: 'Gratitud', script: 'Cierra los ojos. Pon una mano sobre el corazón.\nVamos a activar los circuitos de recompensa con gratitud genuina.\nNo gratitud de lista. Gratitud sentida.\nPiensa en una persona en tu vida por la que sientas agradecimiento real.\nNo la idea de esa persona. Esa persona de verdad.\nTráela a la mente. Recuerda un momento específico con ella.\nSiente eso en el pecho. Nota la calidez.\nEso es dopamina. Eso es serotonina. Cambiando tu estado cerebral ahora mismo.\nAhora piensa en algo simple que tienes hoy.\nSalud, un lugar donde dormir, un café por la mañana.\nAlgo que dabas por sentado pero que no tiene por qué estar ahí.\nSiente el valor real de eso.\nY por último, algo de hoy. Un pequeño momento positivo de hoy.\nAunque haya sido breve. Una pequeña cosa.\nSiente los tres. La persona, lo que tienes, el momento de hoy.\nRespira.\nEl cerebro tiene un sesgo hacia lo negativo por defecto. Esto lo reequilibra.\nCuando abras los ojos, llevas ese estado contigo.' },

  // Cuerpo
  { title: 'Chequeo corporal rápido', minutes: 3, icon: Hand, description: 'Escaneo corporal ultrarrápido para reconectar con sensaciones físicas y salir de la trampa mental.', free: true, theme: 'Cuerpo', script: 'Siéntate o túmbate. Cierra los ojos.\nTu cuerpo habla constantemente. La mayoría del tiempo no escuchamos.\nVamos a hacer un escaneo rápido. No para cambiar nada. Solo para notar.\nLleva la atención a la cabeza. Hay tensión en la frente. En los ojos. Solo nota.\nBaja a la mandíbula y el cuello. Es uno de los sitios donde más cargamos sin saber.\nLos hombros. Están subidos. Hay peso acumulado ahí.\nEl pecho. Sientes apertura o contracción.\nEl abdomen. Está tenso o suelto.\nLa parte baja de la espalda. Hay incomodidad.\nLos muslos, las rodillas, las pantorrillas.\nLos pies. Los sientes.\nAhora haz un barrido de todo. Desde la cabeza hasta los pies.\nDónde está la mayor tensión ahora mismo.\nSin juzgar. Solo sabiéndolo.\nEl cuerpo guarda todo lo que la mente no procesa.\nEscucharlo ya es parte de la solución.\nAbre los ojos cuando quieras.' },

  // ── PREMIUM (15) ─────────────────────────────────────────────────

  // Ansiedad
  { title: 'Reducir ansiedad', minutes: 8, icon: Timer, description: 'Reduce la activación del sistema nervioso simpático con respiración + anclaje sensorial guiado.', free: false, theme: 'Ansiedad', script: 'Siéntate cómodamente. Cierra los ojos.\nEl sistema nervioso simpático te mantiene en alerta. Vamos a activar su contraparte: el parasimpático.\nRespira profundo. Inhala... y exhala lentamente.\nPrimer anclaje: los sonidos. Nombra mentalmente tres sonidos que escuchas ahora. No los juzgues.\nSegundo anclaje: el tacto. Siente el peso del cuerpo en la silla. Los pies en el suelo.\nTercer anclaje: la respiración. Sigue el aire entrando y saliendo. Sin forzar.\nCada exhalación larga activa el nervio vago. Tu freno natural.\nSi aparece un pensamiento de preocupación, obsérvalo y vuelve al anclaje del cuerpo.\nInhala cuatro segundos... exhala ocho. Repite.\nLa amígdala baja su activación. La corteza prefrontal recupera el control.\nSigue respirando. Anclado en el presente. En lo que es real ahora mismo.\nCada ciclo de respiración te acerca a la calma.\nCuando estés listo, abre los ojos con suavidad.' },
  { title: 'Ansiedad profunda', minutes: 15, icon: Shield, description: 'Sesión completa para desactivar el estrés crónico. Relajación muscular progresiva de Jacobson adaptada.', free: false, theme: 'Ansiedad', script: 'Túmbate o siéntate muy cómodamente. Cierra los ojos.\nVamos a hacer relajación muscular progresiva. Tensamos y soltamos cada grupo muscular.\nEmpieza por los pies. Flexiona los dedos hacia ti. Tensa... cinco segundos... y suelta. Siente la diferencia.\nTensa las pantorrillas. Cinco segundos... suelta.\nLos muslos. Aprieta... y suelta completamente.\nLos glúteos. Tensa... suelta.\nEl abdomen. Contrae suavemente... y libera.\nEl pecho. Inspira y retén la tensión... exhala y suelta.\nLos hombros. Levántalos hacia las orejas... y déjalos caer.\nLos brazos. Puños cerrados, bíceps tensos... suelta.\nLas manos. Aprieta... y abre los dedos lentamente.\nEl cuello. Lleva la barbilla al pecho... suelta.\nLa mandíbula. Aprieta los dientes... y abre la boca suavemente.\nLa frente. Arruga... y alisa.\nTodo el cuerpo pesado y relajado. Respira profundo. El estrés crónico se disipa con la práctica.\nQuédate así el tiempo que necesites.' },

  // Presencia
  { title: 'Atención plena', minutes: 10, icon: Eye, description: 'Entrena el foco atencional sostenido. Fortalece la corteza prefrontal dorsolateral con práctica deliberada.', free: false, theme: 'Presencia', script: 'Siéntate con la espalda recta. Cierra los ojos.\nVamos a entrenar el foco atencional. Como un músculo, la atención se fortalece con la práctica.\nElige un ancla: la respiración en el abdomen, o las sensaciones en las fosas nasales.\nColoca ahí tu atención. Sin esfuerzo excesivo. Como si observaras con curiosidad.\nEn algún momento la mente se irá. Un pensamiento, un recuerdo, un plan.\nCuando notes que te fuiste, no te critiques. El darte cuenta ya es el entrenamiento.\nDi mentalmente "pensamiento" y vuelve con amabilidad al ancla.\nCada vuelta fortalece la conexión entre corteza cingulada anterior y prefrontal dorsolateral.\nEso se traduce en mejor concentración en la vida diaria. Menor dispersión.\nSigue. Cada distracción es una repetición más. No importa cuántas veces te vayas.\nLo que importa es volver. Una y otra vez.\nAl final de la sesión, nota la calidad de tu atención. Más estable que al inicio.' },
  { title: 'El observador', minutes: 12, icon: Eye, description: 'Observa tus pensamientos sin identificarte con ellos. La separación consciente que lo cambia todo.', free: false, theme: 'Presencia', script: 'Siéntate en silencio. Cierra los ojos.\nNo eres tus pensamientos. Eres quien los observa. Hoy lo experimentarás directamente.\nImagina que estás sentado en la orilla de un río. El agua fluye.\nTus pensamientos son hojas que flotan en el río. Algunas lentas, otras rápidas.\nTu trabajo: observar las hojas desde la orilla. Sin subirte a ninguna.\nCuando notes que te subiste a una hoja, que estás dentro del pensamiento...\nSimplemente di "enganchado" y vuelve a la orilla. Sin juicio.\nLa corteza prefrontal medial genera la narrativa del yo. Al observar sin identificarte, reduces su actividad.\nAparece el espacio. Ese espacio es consciencia pura. No es un pensamiento.\nSigue observando. Las hojas vienen y van. Tú permaneces en la orilla.\nCada vez que vuelves, el observador se fortalece.\nEse observador no piensa. Presencia. Silencio. Libertad.\nCuando abras los ojos, lleva esa cualidad al día.' },
  { title: 'Presencia profunda', minutes: 15, icon: Crosshair, description: 'Desactiva la Red Neuronal por Defecto. Estado de observación pura sin contenido mental.', free: false, theme: 'Presencia', script: 'Postura estable. Ojos cerrados. Sin objeto de meditación específico.\nLa Red Neuronal por Defecto se activa cuando la mente no tiene tarea. Rumia, pasado, futuro.\nHoy no seguiremos ningún contenido. Solo presencia abierta.\nNota lo que surge: pensamiento, sensación, sonido. No lo alimentes. No lo rechaces.\nComo nubes que pasan por el cielo. El cielo no se aferra a las nubes.\nSi te enganchas en una historia, nota el enganche y suelta.\nVuelve al espacio abierto. A la consciencia que contiene todo sin identificarse con nada.\nNo hay nada que hacer. Solo estar. Solo notar que estás notando.\nLa DMN pierde fuerza cuando dejas de alimentarla con atención.\nEl silencio entre pensamientos se expande. Ese silencio es tu naturaleza.\nRespira. El cuerpo está aquí. La mente puede estar en calma.\nSin esfuerzo. Sin búsqueda. Presencia pura.\nPermanece así el tiempo que reste.' },

  // Sueño
  { title: 'Yoga Nidra express', minutes: 10, icon: Moon, description: 'Relajación consciente profunda. El estado entre vigilia y sueño donde ocurre la restauración neural.', free: false, theme: 'Sueño', script: 'Túmbate boca arriba. Brazos a los lados. Cierra los ojos.\nYoga Nidra es el sueño consciente. El cerebro se relaja profundamente mientras mantienes un hilo de consciencia.\nNo hagas nada. Solo escucha y sigue.\nLleva la atención al pie derecho. Dedos, planta, talón. Siente.\nTobillo derecho. Pantorrilla. Rodilla. Muslo. Toda la pierna derecha pesada.\nAhora la pierna izquierda. Pie, tobillo, pantorrilla, rodilla, muslo. Pesada y relajada.\nCaderas, vientre, pecho. Cada zona se abandona.\nHombros, brazos, manos. Dedos relajados.\nCuello, mandíbula, mejillas, frente. Todo suelto.\nEstás en el umbral entre vigilia y sueño. Las ondas cerebrales se ralentizan.\nEl cuerpo se repara. La mente descansa.\nCuando estés listo para dormir, déjate ir. Si es de día, abre los ojos muy despacio.' },
  { title: 'Sueño profundo', minutes: 20, icon: Moon, description: 'Sesión completa para insomnio. Induce ondas delta cerebrales mediante relajación progresiva guiada.', free: false, theme: 'Sueño', script: 'Túmbate en la cama. Postura cómoda para dormir. Cierra los ojos.\nEsta sesión te guiará hacia el sueño. No luches. Solo sigue la voz.\nRespira profundo tres veces. Inhala... exhala soltando todo.\nEscaneo desde los pies. Siente los dedos. Relájalos. Tobillos. Pantorrillas. Todo pesado.\nRodillas. Muslos. Las piernas son de plomo.\nCaderas y glúteos. El peso del cuerpo en el colchón.\nAbdomen. Se mueve suavemente con la respiración.\nPecho. Hombros. Deja que se hundan en la cama.\nBrazos. Manos. Dedos totalmente sueltos.\nCuello. Mandíbula entreabierta. Lengua reposando.\nMejillas. Párpados. Frente. Todo el rostro relajado.\nEl cuerpo entero pesado. Caliente. Seguro.\nCuenta regresiva: diez... más pesado. Nueve... ocho... hundiéndote.\nSiete... seis... el sueño se acerca. Cinco... cuatro...\nTres... dos... uno... Déjate ir. Duerme.' },

  // Emociones
  { title: 'Regulación emocional', minutes: 12, icon: Heart, description: 'Procesa emociones difíciles sin reprimirlas. Protocolo Detecta-Nombra-Regula con base neurocientífica.', free: false, theme: 'Emociones', script: 'Siéntate cómodamente. Cierra los ojos.\nLas emociones no son el enemigo. El problema es reaccionar sin elegir. Hoy practicamos el protocolo Detecta, Nombra, Regula.\nPaso uno: Detecta. Escanea el cuerpo. ¿Dónde sientes algo? Pecho, garganta, estómago.\nNo cambies nada. Solo nota. La emoción tiene coordenadas corporales.\nPaso dos: Nombra. ¿Qué es? Ansiedad, tristeza, enfado, miedo. Ponle palabra.\nNombrar activa la corteza prefrontal y reduce la amígdala hasta un cincuenta por ciento. Es el afect labeling.\nPaso tres: Regula. Inhala cuatro segundos. Exhala ocho. Tres veces.\nLa exhalación larga activa el nervio vago. El sistema parasimpático calma.\nRepite con cualquier emoción que surja. Detecta, nombra, regula.\nNo reprimas. No te identifiques. Procesa.\nCada ciclo te da más espacio entre emoción y reacción. Ese espacio es libertad.' },
  { title: 'Amor incondicional', minutes: 20, icon: Heart, description: 'Metta bhavana: expande la compasión desde ti hacia todos los seres. Activa la ínsula anterior.', free: false, theme: 'Emociones', script: 'Siéntate con el corazón abierto. Cierra los ojos.\nMetta es amor incondicional. Bondad que no pide nada a cambio. La práctica activa la ínsula anterior.\nEmpieza por ti. Pon una mano en el corazón. Di mentalmente: Que yo esté en paz. Que yo esté libre de sufrimiento. Que yo sea feliz.\nSiente el calor en el pecho. Ese es el inicio.\nAhora piensa en alguien que amas fácilmente. Un ser querido. Envía: Que estés en paz. Que seas libre. Que seas feliz.\nSiente la expansión.\nAhora alguien neutral. Un conocido. Mismas frases. La compasión no distingue.\nAlguien difícil. Sin forzar. Que esté en paz. Que sea libre. Que sea feliz.\nTodos los seres: Que todos estén en paz. Que todos sean libres. Que todos sean felices.\nTu corazón puede contener a todos. La ínsula integra conexión y empatía.\nRespira. Lleva esa cualidad al resto del día.' },

  // Energía
  { title: 'Activación matutina', minutes: 8, icon: Zap, description: 'Respiración energizante + visualización del día. Programa tu corteza prefrontal para el éxito.', free: false, theme: 'Energía', script: 'Siéntate con la espalda recta. Es de mañana. Los ojos pueden estar cerrados o entreabiertos.\nVamos a activar el cuerpo y programar la mente para el día.\nRespiración energizante: inhala rápido por la nariz, exhala rápido por la boca. Tres veces.\nSiente el cuerpo despertar. La sangre circula. La mente se aclara.\nAhora respiración normal. Visualiza tu día. Cómo quieres estar. No qué hacer: cómo estar.\nPresente. Tranquilo. Efectivo. Elige una cualidad.\nImagina el primer momento del día con esa cualidad. El desayuno, la ducha, lo que sea.\nEl momento más difícil. Cómo responderías con esa cualidad.\nEl momento de éxito. Cómo lo celebrarías.\nLa corteza prefrontal puede programarse por la mañana. Intención priming.\nRespira hondo. Esa cualidad ya está en ti. Lleva este estado al día.\nAbre los ojos. El día comienza.' },
  { title: 'Energía vital', minutes: 20, icon: Zap, description: 'Breathwork completo + visualización energizante. Recarga cuerpo y mente desde la neurociencia aplicada.', free: false, theme: 'Energía', script: 'Siéntate erguido. Vamos a recargar cuerpo y mente con breathwork y visualización.\nPrimera fase: Respiración de fuego. Inhalaciones y exhalaciones rápidas por la nariz. Treinta segundos.\nEmpieza... Mantén el ritmo... El cuerpo se oxigena. La mente se despeja.\nPara. Respira normal. Siente el pulso. La energía.\nSegunda fase: Respiración cuadrada. Inhala cuatro, retén cuatro, exhala cuatro, retén cuatro. Cinco ciclos.\nInhala... retén... exhala... retén. El sistema nervioso se equilibra.\nTercera fase: Visualización. Imagina una luz dorada en el centro del pecho.\nCon cada inhalación, la luz crece. Se expande por el torso, brazos, piernas.\nLlega a la cabeza. Todo el cuerpo brilla.\nLa luz sale por la coronilla. Te conecta con el cielo. Con la energía infinita.\nInspira esa energía. Exhala lo que no sirve.\nCuarta fase: Silencio. Cinco minutos de presencia. La energía queda integrada.\nCuando termines, abre los ojos despacio. Lleva esta vitalidad al día.' },

  // Respiración
  { title: 'Coherencia cardíaca', minutes: 12, icon: Heart, description: 'Respiración a 6 ciclos/min. Sincroniza corazón, cerebro y sistema nervioso autónomo.', free: false, theme: 'Respiración', script: 'Siéntate cómodamente. Pon una mano en el corazón si quieres.\nLa coherencia cardíaca es respirar a seis ciclos por minuto. Cinco segundos inhalar, cinco exhalar.\nEso sincroniza corazón, cerebro y sistema nervioso autónomo.\nEmpieza. Inhala suavemente... uno... dos... tres... cuatro... cinco.\nExhala... uno... dos... tres... cuatro... cinco.\nSigue el ritmo. Sin forzar. El corazón entra en coherencia.\nPuedes imaginar que respiras desde el corazón. Que el aire entra y sale por el pecho.\nLos estudios muestran mejor regulación emocional, menor cortisol, mayor claridad mental.\nSigue. Diez minutos de coherencia producen efectos que duran horas.\nSi la mente se dispersa, vuelve al ritmo. Cinco y cinco.\nAl final, permanece un minuto en silencio. Nota el estado de calma activa.\nAbre los ojos cuando quieras.' },

  // Gratitud
  { title: 'Abundancia presente', minutes: 10, icon: Sparkles, description: 'Reprograma el sesgo de negatividad. Neuroplasticidad positiva aplicada a la gratitud profunda.', free: false, theme: 'Gratitud', script: 'Siéntate y cierra los ojos. Pon una mano en el corazón.\nEl cerebro tiene sesgo de negatividad. Hoy lo reequilibramos con gratitud profunda.\nNo lista de agradecimientos. Gratitud sentida. Que active los circuitos de recompensa.\nPiensa en una persona que te haya ayudado. En un momento concreto.\nSiente el calor en el pecho. Eso es dopamina, serotonina. Estado cerebral cambiando.\nAlgo que tienes y das por hecho. Salud. Un techo. Comida.\nNota su valor real. Como si pudieras perderlo y lo recuperaras.\nUn momento bueno de esta semana. Por pequeño que sea.\nSiente los tres. La persona, lo que tienes, el momento.\nEl cerebro registra esto. Con la repetición, el sesgo se corrige.\nExpande: Que todos los seres reconozcan su abundancia.\nRespira. Lleva esta cualidad al día.' },

  // Cuerpo
  { title: 'Escaneo corporal completo', minutes: 15, icon: Hand, description: 'Escaneo profundo de cabeza a pies. Activa la corteza somatosensorial completa. Integración mente-cuerpo.', free: false, theme: 'Cuerpo', script: 'Túmbate o siéntate muy cómodamente. Cierra los ojos.\nEscaneo corporal completo. Activamos la corteza somatosensorial. Reconectamos mente y cuerpo.\nEmpieza por la coronilla. Nota cualquier sensación. Tensión, calor, hormigueo. Veinte segundos.\nFrente, sienes, ojos. No cambies nada. Solo observa.\nMejillas, mandíbula, garganta. Zonas de tensión acumulada.\nHombros. Uno y otro. La carga del día suele estar aquí.\nPechos, costillas. El movimiento de la respiración.\nAbdomen. Órganos internos. Solo nota.\nParte baja de la espalda. Lumbar. Zona que carga mucho.\nCaderas, glúteos. Muslos, rodillas, pantorrillas.\nTobillos, pies, dedos. Sensación de contacto con el suelo.\nBarrido final: de pies a cabeza. Todo el cuerpo como un mapa vivo.\nLa ínsula integra estas señales. Mayor conciencia corporal, mejor regulación emocional.\nAbre los ojos cuando quieras.' },

  // Creatividad
  { title: 'Visualización creativa', minutes: 10, icon: Lightbulb, description: 'Imagina tu proyecto terminado con todos los sentidos. La corteza visual no distingue realidad de imaginación vívida.', free: false, theme: 'Creatividad', script: 'Siéntate relajado. Cierra los ojos.\nLa corteza visual no distingue claramente entre realidad e imaginación vívida. Usaremos eso.\nElige un proyecto o meta. Algo que quieras lograr.\nImagínalo terminado. Completo. No el proceso: el resultado.\nVisualiza el escenario. Dónde estás. Qué ves. Colores, detalles.\nQué escuchas. Voces, sonidos, silencio.\nQué sientes en el cuerpo. Liviano, orgulloso, tranquilo.\nQué hueles si aplica. El ambiente.\nIncluso el sabor. Si hay celebración, un brindis.\nLos cinco sentidos. Cuanto más vívido, más el cerebro lo registra como real.\nEso activa las mismas redes que se activarán cuando lo logres. Preparas el circuito.\nRespira. Siente que ya está hecho. La neuroplasticidad trabaja en tu favor.\nAbre los ojos. Lleva esa certeza a la acción.' },
]

const themes = ['Todas', 'Ansiedad', 'Presencia', 'Sueño', 'Emociones', 'Energía', 'Respiración', 'Gratitud', 'Cuerpo', 'Creatividad']
const durations = ['Todas', '3-5 min', '8-12 min', '15-20 min']

function getDurationRange(filter: string): [number, number] {
  switch (filter) {
    case '3-5 min': return [3, 5]
    case '8-12 min': return [8, 12]
    case '15-20 min': return [15, 20]
    default: return [0, 999]
  }
}

function MeditationCard({ m, playing, isPaused, loadingAudio, onPlay, onPause, onResume, onStop }: {
  m: Meditation
  playing: string | null
  isPaused: boolean
  loadingAudio: string | null
  onPlay: (m: Meditation) => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
}) {
  const isActive = playing === m.title
  const isLoading = loadingAudio === m.title
  const isCurrentlyPlaying = isActive && !isPaused && !isLoading
  return (
    <div className="glass rounded-2xl p-4 flex flex-col card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-accent-blue/15 flex items-center justify-center">
          <m.icon className="w-5 h-5 text-accent-blue" />
        </div>
        <div className="flex items-center gap-2">
          {!m.free && <PremiumBadge />}
          <span className="text-text-muted text-xs">{m.minutes} min</span>
        </div>
      </div>
      <h3 className="font-heading font-semibold text-white text-sm mb-0.5">{m.title}</h3>
      <p className="text-text-secondary text-xs mb-3 flex-1 line-clamp-2">{m.description}</p>
      {isActive && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-accent-amber animate-pulse' : isCurrentlyPlaying ? 'bg-accent-blue animate-pulse' : 'bg-white/30'}`} />
          <span className="text-accent-blue text-[10px]">{isLoading ? 'Preparando audio...' : isCurrentlyPlaying ? 'Reproduciendo...' : 'En pausa'}</span>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (isLoading) return
            if (isCurrentlyPlaying) onPause()
            else if (isActive && isPaused) onResume()
            else onPlay(m)
          }}
          disabled={isLoading}
          className={`flex items-center justify-center gap-2 flex-1 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 disabled:opacity-70 disabled:cursor-wait ${
            isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-white'
          }`}
        >
          {isLoading
            ? <><Play className="w-3.5 h-3.5 animate-pulse" /> Preparando...</>
            : isCurrentlyPlaying
              ? <><Pause className="w-3.5 h-3.5" /> Pausar</>
              : isActive && isPaused
                ? <><Play className="w-3.5 h-3.5" /> Reanudar</>
                : <><Play className="w-3.5 h-3.5" /> Reproducir</>}
        </button>
        {isActive && (
          <button
            onClick={onStop}
            className="py-2 px-3 rounded-xl text-xs font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 active:scale-95 transition-all"
            title="Detener"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
          </button>
        )}
      </div>
    </div>
  )
}

type AmbientRef = { type: 'file'; audio: HTMLAudioElement } | { type: 'synth'; ctx: AudioContext; gain: GainNode; oscs: OscillatorNode[] } | null

function createMeditationAmbientPad(ctx: AudioContext): { gain: GainNode; oscs: OscillatorNode[] } {
  const pad = createSharedAmbientPad(ctx, 0.18)
  return { gain: pad.gain, oscs: pad.oscs }
}

/** Fade-in suave para música ambiental (evita pops/ruidos al inicio) */
function fadeInAmbientMusic(audio: HTMLAudioElement, durationMs = 2500): void {
  audio.volume = 0
  const steps = 20
  const stepMs = durationMs / steps
  const stepVol = 0.25 / steps
  let i = 0
  const interval = setInterval(() => {
    i++
    audio.volume = Math.min(i * stepVol, 0.25)
    if (i >= steps) clearInterval(interval)
  }, stepMs)
}

/** Solo tracks que existen en public/ — evita 404, música sin voz y ruido de synth */
const DEFAULT_TRACKS = [
  '/Calm-ambient-music-ocean-waves-for-sleep-and-relaxation.mp3',
  '/Calm-ambient-music-ocean-waves-for-sleep-and-relaxation (1).mp3',
  '/Free-meditation-music.mp3',
  '/Free-meditation-music (1).mp3',
  '/Relaxing-analog-synth-piano-music.mp3',
  '/Warm-ambient-relaxing-synth-pad-music.mp3',
]

async function getAmbientTracks(): Promise<string[]> {
  try {
    const res = await fetch('/api/audio-config')
    if (!res.ok) return DEFAULT_TRACKS
    const cfg = await res.json() as Record<string, string>
    const urls = Object.values(cfg).filter(Boolean)
    return urls.length > 0 ? urls : DEFAULT_TRACKS
  } catch { return DEFAULT_TRACKS }
}

function startAmbientMusic(
  tracks: string[],
  onFallback: () => void,
  onSuccess: (ref: AmbientRef) => void,
  isCancelled: () => boolean
): AmbientRef {
  const validTracks = tracks.filter(Boolean).length > 0 ? tracks : DEFAULT_TRACKS
  const shuffled = [...validTracks].sort(() => Math.random() - 0.5)
  const placeholder = { type: 'file' as const, audio: new Audio() }

  const tryTrack = (idx: number): void => {
    if (isCancelled()) return
    if (idx >= shuffled.length) {
      onFallback()
      return
    }
    const src = shuffled[idx]
    const audio = new Audio(src)
    audio.loop = true
    audio.volume = 0
    audio.onerror = () => { if (!isCancelled()) tryTrack(idx + 1) }
    audio.play()
      .then(() => {
        if (isCancelled()) return
        fadeInAmbientMusic(audio, 2500)
        onSuccess({ type: 'file', audio })
      })
      .catch(() => { if (!isCancelled()) tryTrack(idx + 1) })
  }

  tryTrack(0)
  return placeholder
}

function stopAmbient(ambient: AmbientRef) {
  if (!ambient) return
  if (ambient.type === 'file') {
    ambient.audio.pause()
    ambient.audio.currentTime = 0
  } else {
    ambient.gain.gain.setTargetAtTime(0, ambient.ctx.currentTime, 0.04)
    setTimeout(() => {
      ambient.oscs.forEach(o => { try { o.stop(ambient.ctx.currentTime) } catch { /* ignore */ } })
      try { ambient.ctx.close() } catch { /* ignore */ }
    }, 130)
  }
}

function pauseAmbient(ambient: AmbientRef) {
  if (!ambient) return
  if (ambient.type === 'file') ambient.audio.pause()
  else ambient.gain.gain.setTargetAtTime(0, ambient.ctx.currentTime, 0.1)
}

const AMBIENT_VOLUME = 0.22

function resumeAmbient(ambient: AmbientRef) {
  if (!ambient) return
  if (ambient.type === 'file') ambient.audio.play().catch(() => {})
  else ambient.gain.gain.setTargetAtTime(AMBIENT_VOLUME, ambient.ctx.currentTime, 0.1)
}


export default function MeditationCards() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [themeFilter, setThemeFilter] = useState('Todas')
  const [durationFilter, setDurationFilter] = useState('Todas')
  const [ambientTracks, setAmbientTracks] = useState<string[]>(DEFAULT_TRACKS)
  const generationRef = useRef(0)
  const ambientRef = useRef<AmbientRef>(null)
  const playIdRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const playStartTimeRef = useRef<number>(0)
  const playingTitleRef = useRef<string | null>(null)
  const ttsAudioRef = useRef<{ audio: HTMLAudioElement; url?: string; voiceRefs?: import('@/lib/audio-utils').VoiceRefs } | null>(null)

  useEffect(() => {
    getAmbientTracks().then(setAmbientTracks)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.speechSynthesis?.getVoices()
    const loadVoices = () => window.speechSynthesis?.getVoices()
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices)
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices)
  }, [])

  const stopMeditation = useCallback((currentTitle?: string) => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    setLoadingAudio(null)
    playIdRef.current = 0
    if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    const ref = ttsAudioRef.current
    ttsAudioRef.current = null
    stopAmbient(ambientRef.current)
    ambientRef.current = null
    const trackTitle = currentTitle ?? playingTitleRef.current
    playingTitleRef.current = null
    if (trackTitle && playStartTimeRef.current > 0) {
      const durationSeconds = Math.floor((Date.now() - playStartTimeRef.current) / 1000)
      trackSessionInterrupted('meditation', trackTitle, durationSeconds)
    }
    playStartTimeRef.current = 0
    setPlaying(null)
    setIsPaused(false)
    if (ref) {
      stopVoiceWithFadeOut(ref.audio, ref.voiceRefs ?? null, ref.url, () => {})
    }
  }, [])

  useEffect(() => {
    return () => {
      unregister('meditation')
      stopMeditation()
    }
  }, [stopMeditation])

  const startTTS = useCallback((med: Meditation) => {
    if (!window.speechSynthesis || !med.script) return
    playingTitleRef.current = med.title
    setPlaying(med.title)
    setIsPaused(false)
    const generation = ++generationRef.current
    const lines = med.script.split('\n').map(s => s.trim()).filter(Boolean)
    let i = 0
    const getVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      return voices.find(v => v.lang.startsWith('es') && (v.name.includes('Paulina') || v.name.includes('Monica') || v.name.includes('Microsoft') || v.name.includes('Google')))
        || voices.find(v => v.lang.startsWith('es') && v.name.includes('female'))
        || voices.find(v => v.lang.startsWith('es'))
    }
    const next = () => {
      if (generationRef.current !== generation) return
      if (i >= lines.length) {
        recordActivity()
        stopMeditation()
        return
      }
      const utt = new SpeechSynthesisUtterance(lines[i++])
      utt.lang = 'es-ES'
      utt.rate = 0.4
      utt.pitch = 0.92
      utt.volume = 1
      const esVoice = getVoice()
      if (esVoice) utt.voice = esVoice
      utt.onend = next
      utt.onerror = () => { if (i >= lines.length) stopMeditation() }
      window.speechSynthesis.speak(utt)
    }
    if (getVoice()) {
      next()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        if (generationRef.current === generation) next()
      }
      setTimeout(() => {
        if (generationRef.current === generation && !window.speechSynthesis.speaking) next()
      }, 500)
    }
  }, [stopMeditation])

  const handlePlay = useCallback(async (m: Meditation) => {
    if (typeof window === 'undefined' || !m.script) return
    stopMeditation(playingTitleRef.current ?? undefined)
    claimAndPlay('meditation', () => stopMeditation(playingTitleRef.current ?? undefined))
    window.speechSynthesis?.cancel()
    const thisPlayId = ++playIdRef.current
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal
    const startAmbient = () => {
      if (playIdRef.current !== thisPlayId) return
      const fallbackToSynth = () => {
        if (playIdRef.current !== thisPlayId) return
        if (ambientRef.current?.type === 'file') {
          stopAmbient(ambientRef.current)
          ambientRef.current = null
        }
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const createPad = () => {
          if (playIdRef.current !== thisPlayId) {
            try { ctx.close() } catch {}
            return
          }
          const { gain, oscs } = createMeditationAmbientPad(ctx)
          gain.gain.setTargetAtTime(0.18, ctx.currentTime, 0.5)
          if (playIdRef.current !== thisPlayId) {
            gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1)
            oscs.forEach(o => { try { o.stop() } catch {} })
            try { ctx.close() } catch {}
            return
          }
          ambientRef.current = { type: 'synth', ctx, gain, oscs }
        }
        if (ctx.state === 'suspended') ctx.resume().then(createPad).catch(() => { try { ctx.close() } catch {} })
        else createPad()
      }
      const isCancelled = () => playIdRef.current !== thisPlayId
      const onSuccess = (ref: AmbientRef) => {
        if (isCancelled()) {
          stopAmbient(ref)
          return
        }
        ambientRef.current = ref
      }
      ambientRef.current = startAmbientMusic(ambientTracks, fallbackToSynth, onSuccess, isCancelled)
    }
    startAmbient()

    const tryElevenLabs = async () => {
      playingTitleRef.current = m.title
      setPlaying(m.title)
      setLoadingAudio(m.title)
      setIsPaused(false)
      playStartTimeRef.current = Date.now()
      trackSessionStart('meditation', m.title)
      try {
        const blob = await fetchElevenLabsTTS(m.script!, { signal })
        if (playIdRef.current !== thisPlayId || signal.aborted) return
        if (!blob) throw new Error('ElevenLabs fallback')
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = 1
        audio.playbackRate = 0.88
        audio.onended = () => {
          const dur = playStartTimeRef.current > 0 ? Math.floor((Date.now() - playStartTimeRef.current) / 1000) : 0
          trackSessionComplete('meditation', m.title, dur)
          recordActivity()
          stopMeditation()
        }
        audio.onerror = () => stopMeditation()
        setLoadingAudio(null)
        if (playIdRef.current !== thisPlayId || signal.aborted) {
          URL.revokeObjectURL(url)
          return
        }
        const voiceRefs = await playAudioWithFadeIn(audio)
        if (playIdRef.current !== thisPlayId || signal.aborted) {
          URL.revokeObjectURL(url)
          try { voiceRefs.ctx.close() } catch {}
          return
        }
        ttsAudioRef.current = { audio, url, voiceRefs }
      } catch {
        if (playIdRef.current !== thisPlayId || signal.aborted) return
        setLoadingAudio(null)
        startTTS(m)
      }
    }

    tryElevenLabs()
  }, [stopMeditation, startTTS, ambientTracks])

  const handlePause = useCallback(() => {
    if (ttsAudioRef.current) ttsAudioRef.current.audio.pause()
    else window.speechSynthesis?.pause()
    pauseAmbient(ambientRef.current)
    setIsPaused(true)
  }, [])

  const handleResume = useCallback(() => {
    if (ttsAudioRef.current) ttsAudioRef.current.audio.play().catch(() => {})
    else window.speechSynthesis?.resume()
    resumeAmbient(ambientRef.current)
    setIsPaused(false)
  }, [])

  const [minDur, maxDur] = getDurationRange(durationFilter)

  const filtered = meditations.filter((m) => {
    const themeMatch = themeFilter === 'Todas' || m.theme === themeFilter
    const durMatch = m.minutes >= minDur && m.minutes <= maxDur
    return themeMatch && durMatch
  })

  const freeCount = filtered.filter(m => m.free).length
  const premiumCount = filtered.filter(m => !m.free).length

  return (
    <div>
      {/* Theme filters */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Tag className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-muted text-xs font-medium">Tema</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setThemeFilter(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                themeFilter === t
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-text-secondary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Duration filters */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-muted text-xs font-medium">Duración</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setDurationFilter(d)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                durationFilter === d
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-text-secondary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-text-muted text-xs">{filtered.length} meditaciones</span>
        <span className="text-text-muted text-xs">·</span>
        <span className="text-green-400 text-xs">{freeCount} gratis</span>
        {premiumCount > 0 && (
          <>
            <span className="text-text-muted text-xs">·</span>
            <span className="text-accent-blue text-xs">{premiumCount} premium</span>
          </>
        )}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((m) =>
            m.free ? (
              <MeditationCard key={m.title} m={m} playing={playing} isPaused={isPaused} loadingAudio={loadingAudio} onPlay={handlePlay} onPause={handlePause} onResume={handleResume} onStop={stopMeditation} />
            ) : (
              <PremiumLock key={m.title} label={m.title}>
                <MeditationCard m={m} playing={playing} isPaused={isPaused} loadingAudio={loadingAudio} onPlay={handlePlay} onPause={handlePause} onResume={handleResume} onStop={stopMeditation} />
              </PremiumLock>
            )
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-text-muted text-sm">No hay meditaciones con estos filtros.</p>
          <button
            onClick={() => { setThemeFilter('Todas'); setDurationFilter('Todas') }}
            className="mt-3 text-accent-blue text-sm font-medium active:opacity-70"
          >
            Ver todas
          </button>
        </div>
      )}
    </div>
  )
}
