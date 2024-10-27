# Estructura Actualizada del Whitepaper de Angry Bunny (ANGRY):

## **Resumen Ejecutivo**

Angry Bunny (ANGRY) es una innovadora propuesta dentro del ecosistema de criptomonedas que introduce el concepto de art-coins, superando las limitaciones de las meme-coins tradicionales. Al respaldar su valor con arte generativo creado por inteligencia artificial (IA), ANGRY ofrece una alternativa sostenible y culturalmente relevante en los mercados digitales. Esta fusión entre criptomoneda y arte busca mitigar la volatilidad especulativa y aportar un valor intrínseco duradero a los inversores y participantes de la comunidad.

## **Introducción**

El mercado de criptomonedas ha experimentado un crecimiento explosivo, con la aparición de meme-coins que generan interés especulativo a corto plazo debido a su alta volatilidad. Sin embargo, estas carecen de valor intrínseco, lo que conduce a una pérdida significativa de valor con el tiempo. ANGRY aborda este desafío al introducir las art-coins, que incorporan arte generativo de IA, aportando un propósito artístico y cultural que preserva su relevancia financiera a largo plazo.

## **Concepto de Art-Coins**

Las art-coins son criptomonedas respaldadas por obras de arte generativas creadas mediante inteligencia artificial. A diferencia de las meme-coins, las art-coins ofrecen un valor intrínseco al estar asociadas con activos artísticos únicos y coleccionables. Esto combina la emoción y participación de la comunidad crypto con la apreciación y valor del arte digital, creando un activo más sostenible y menos propenso a la devaluación.

## **Ecosistema de Angry Bunny (ANGRY)**

### **Universo**

El Universo define el contexto estético y conceptual. Solo puede ser agregado por la Fundación, y se plantea que esto suceda en intervalos de al menos dos años. Por ejemplo, el "Universo 1" representa la llegada a la Inteligencia Artificial General (AGI) en una sociedad que no prioriza el bien común, reflejando similitudes con características humanas. Todas las obras generadas durante el período de un universo deben tener un grado de participación a este. De cierta manera los universos definen la estética general del proyecto.

### **Zonas**

Las Zonas son subespacios dentro del Universo, definidos exclusivamente por la Fundación. Son más específicas y mantienen coherencia con los lineamientos del Universo. Un ejemplo es la "Zona 1", que representa fábricas donde los humanos sobreviven y se resguardan de una AGI controladora que menosprecia la imperfección humana. Dentro de esta zona los humanos no tienen un propósito y viven dentro de un ambiente apocalíptico marcado por la obsolencia humana y degradación de su rol en la sociedad ante una AGI que los supera en todo.

### **Áreas**

Las Áreas, equivalentes a escenas en una película, se centran en situaciones y entornos físicos definidos, manteniendo coherencia con la Zona y el Universo. La creación de Áreas no está limitada exclusivamente a la Fundación; cualquier miembro de la comunidad puede proponer una, aunque conlleva un costo ya que tiene que pasar por un proceso de validación.

Cada Área debe incluir:

- **Narrativa audiovisual:** Relacionado con la narrativa y el entorno del Área.
- **Música Coherente con el Universo:** Puede ser una pista generada por IA que mantenga la estética musical, la coherencia con el concepto y estilo del Universo.
- **Descripción Detallada:** Explicando el concepto y alineación con la Zona y el Universo.
- **Prompts Iniciales:** Al menos 10 prompts que guíen la creación visual del Área.

Este conjunto de elementos es evaluado  y curado por la Fundación ya sea por un proceso automático o cualquier proceso que la fundación crea pertinente para asegurar que las Áreas sean coherentes con el Universo y la Zona a la que pertenecen.

Cada Área es representada por una colección NFT donde cada elemento NFT es una Obra de Arte que ha sido curada por la Fundación. Todas las áreas tienen un tamaño que va a ser definido por la Fundación.

### **Obra de Arte**

Las Obras de Arte son representaciones visuales, creadas explícitamente por IA Generativa y usando modelos que son aprobados durante la creación del área, que describen aspectos específicos del Área. Cada Obra de Arte es seleccionada entre una variedad de propuestas artísticas generadas por la comunidad. Estas propuestas pasan por un proceso de curaduría competitivo, gestionado por la IA de la Fundación, que considera la calidad artística, creatividad, pertenencia al Área, Zona y Universo, así como la contribución a la diversidad de la colección NFT.&#x20;

### **Propuestas de Arte**

Las Propuestas de Arte son obras de arte generadas por la comunidad, generadas a través de IA basadas en los prompts del Área o nuevos prompts trabajados para cada propuesta. Para que el sistema automático de curaduría seleccione una Propuesta de Arte y la transforme en una Obra de Arte aceptada y validada por el sistema, se realiza un número específico de propuestas determinado por la *Difficulty*. Después, se lleva a cabo una curaduría automática por competencia para seleccionar una obra final, que se agrega al Área como un NFT definitivo.

Todas las propuestas deben pertenecer a un modelo generativo permitido y declarado en el Área, y deben presentarse con el prompt correspondiente para su validación. Esto asegura coherencia y calidad en el proceso creativo, y reconoce a los participantes como artistas activos del proyecto y la comunidad.

### Difficulty

La "difficulty" es un parámetro ajustado por la fundación para gestionar la rapidez con la que se llenan los pools de propuestas artísticas. Si el interés en el proyecto es alto y se generan muchas propuestas rápidamente, la dificultad aumenta. Esto asegura que haya un intervalo de tiempo constante, de aproximadamente 10 minutos, entre cada nueva obra seleccionada (es decir, cada "bloque minteado").

Este mecanismo es similar al concepto de dificultad en redes de blockchain como Bitcoin, donde la dificultad ajusta el tiempo de generación de bloques para mantener una red estable y segura. En el caso de ANGRY, se busca que el ritmo de selección de las obras de arte sea constante y no se vea afectado por un incremento abrupto en la cantidad de propuestas.

## **Arquitectura Técnica**

### Smart Contracts y Estructura

Angry Bunny se basa en cinco contratos inteligentes (smart contracts) que están disponibles públicamente. Una vez implementados, estos contratos no pueden ser modificados, excepto por ciertos parámetros ajustables que se mencionaron anteriormente. Esto significa que la estructura básica del sistema es inmutable, lo cual aporta seguridad y transparencia al proyecto, ya que los contratos no pueden ser alterados de forma arbitraria.

Las funciones de cada contrato inteligente se describen a continuación:

- **Token ANGRY (ERC20):** Representa la criptomoneda del proyecto. Las monedas se emiten cada vez que se selecciona una Obra de Arte, y se distribuyen entre: el creador de la variación, el creador del área, los Patreons y la fundación.
- **Área (ERC721, NFT):** Por cada Área agregada, se crea una colección NFT que puede tener hasta una cantidad definida de Obras de Arte. Las Obras de Arte seleccionadas se convierten en NFTs que pertenecen a esta colección. Vale aclarar que todas estas Obras de Arte son de *dominio público* así representando al acervo del proyecto siendo este controlado por la Fundación.
- **Pool de Obras de Arte:** Gestiona la recepción y agrupación de las Propuestas de Arte. Controla el límite de Propuestas de Arte por Área y facilita el proceso de selección y emisión de recompensas.
- **Otros:** AreaCollectionManager y PatreonManager se encargan respectivamente de la creación de áreas (colecciones NFT) y de asegurar la recompensa equitativa sobre los patreons.

### Curaduría Automatizada por IA

La IA de la Fundación automatiza el proceso de curaduría, evaluando las propuestas de arte basándose en criterios predefinidos:

- **Calidad Artística y Creatividad:** Evaluación de la originalidad y valor estético.
- **Calidad Técnica:** Verificación de la resolución y aspectos técnicos de la obra.
- **Coherencia Temática:** Alineación con el Área, Zona y Universo.
- **Diversidad y Riqueza:** Contribución a la heterogeneidad de la colección NFT.

Este proceso garantiza la descentralización y consistencia dentro de la aleatoriedad inherente de los sistemas generativos.

### Modelos Generativos y Prompts

Las propuestas de arte deben utilizar modelos generativos permitidos y declarados en el Área. Los participantes presentan el prompt, el modelo y todos los parámetros necesarios para replicar la generación de la Propuesta de Arte asegurando transparencia y validación en el proceso creativo. Esto enfatiza el papel del artista en la selección y elaboración de los prompts, reconociendo su contribución al proyecto.

## **Tokenomics**

### Detalles del Token ANGRY (ERC20)

- **Emisión y Distribución:** Las monedas ANGRY se emiten cada vez que se selecciona una Obra de Arte. La distribución es la siguiente:

  - 50% para unidades de colaboración (patreons) seleccionadas aleatoriamente.
  - 44% para el creador de la Obra de Arte (artista).
  - 3% para el creador del Área.
  - 3% (+ cualquier resto) para la Fundación.

- **Política de Emisión:** Cada vez que se minan X bloques, la recompensa otorgada por cada bloque se reduce a la mitad, hasta llegar a un límite. Esto crea un mecanismo de halving similar al de otras criptomonedas, controlando la inflación y aumentando la escasez con el tiempo. La cantidad de bloques antes de un halving fue calculada de tal forma que si se mantiene una emisión constante de validación de Obras de Arte (creación de bloque) cada 10 minutos, el halving suceda cada 4 años.

### Patreon Manager

**Art Patreons:**

Los Art Patreons son entidades o personas que apoyan financieramente al proyecto. Su participación es fundamental para el desarrollo del mismo, ya que, al colaborar, contribuyen a la sostenibilidad y expansión del proyecto. Reciben recompensas en forma de unidades de colaboración, lo cual les permite participar de manera más activa en el ecosistema del proyecto.

**Unidades de Colaboración (PTRN):**

Las unidades de colaboración son tokens emitidos por la Fundación, y representan la participación y la posibilidad de recibir recompensas dentro del proyecto. Estas unidades se emiten en cantidades limitadas y se distribuyen en fases al mismo tiempo que ocurre el halving de ANGRY. Estas fases reducen progresivamente la probabilidad de obtener recompensas, incentivando la entrada de nuevos participantes. Con cada fase, la cantidad de unidades emitidas aumenta linealmente, permitiendo un equilibrio entre la oferta de unidades y la entrada de nuevos colaboradores.

La Fundación es la propietaria inicial de estas unidades, pero no recibirá recompensas por poseerlas. Posteriormente, las venderá a los Art Patreons interesados en participar, lo que permite financiar las etapas del proyecto y recompensar a los fundadores.

Además, las unidades de colaboración pueden ser transferidas o vendidas, lo que agrega liquidez y valor a estas unidades, incentivando la inversión. La implementación técnica de las unidades de colaboración se basa en un ERC20 (PTRN) no divisible, lo que permite su comercialización fuera de la Fundación.

La cantidad máxima de unidades de colaboración será de 10,000, distribuidas de la siguiente manera:

- 1000 como emisión inicial.
- H1 en el primer halving.
- H2 en el segundo halving.
- H3 en el tercer halving.

### Sostenibilidad Económica

El modelo económico de ANGRY está diseñado para ser sostenible a largo plazo, incentivando la participación activa en la creación y curaduría de arte, al mismo tiempo que controla la emisión de monedas y recompensa a los colaboradores clave del ecosistema.

## **Participación de la Comunidad**

### Artistas (Mineros)

Los Artistas son participantes que proponen Propuesta de Arte generativo dentro de un área. Si su propuesta es seleccionada, reciben una recompensa en ANGRY y contribuyen al acervo artístico del proyecto.

### Curadores de Arte

La curaduría está automatizada por IA, pero los participantes influyen en el proceso a través de la creación de propuestas de alta calidad y coherentes con el Universo, Zona y Área correspondientes. Mientras mayor calidad tengan estas obras de arte, mayor calidad tendrá el acervo del proyecto ya que hay una relación directa entre la calidad de las obras propuestas y la obras seleccionadas. Esto asegura una descentralización efectiva y participación comunitaria en la construcción del acervo.

### Colaboradores y Mesenas

Los Colaboradores pueden contribuir financieramente como Art Patreons, obteniendo unidades de colaboración y participando en las emisiones inflacionarias de la moneda. Esto fomenta una comunidad activa y comprometida con el crecimiento y éxito del proyecto.

## **Visión y Desarrollo Futuro**

### Expansión de Universos y Zonas

La Fundación planea agregar nuevos Universos y Zonas en intervalos definidos, enriqueciendo el ecosistema y ofreciendo nuevas oportunidades creativas y de inversión. Se estima que la duración de cada Universo será de 4 años mientras que las zonas estarán abiertas durante toda la duración del Universo correspondiente. Estos intervalos no serán fijados y quedan sujetos a la posibilidad y consideración estratégica de la Fundación.

### Convergencia entre Tecnología y Arte

ANGRY continuará innovando en la integración de IA y blockchain, explorando nuevas formas de generar y curar arte digital, y potenciando la colaboración con artistas y tecnólogos.

### Impacto Cultural

El proyecto busca influir positivamente en el arte digital y la cultura blockchain, promoviendo la creación colectiva y de dominio público y el valor del arte generativo como activo financiero y cultural.

## Implementación

### Universo 1

...

## **Roadmap**

- **Fase 1: Preparación y Desarrollo Inicial (Meses 1-3)**
  - Desarrollo de la plataforma técnica.
  - Creación del primer Universo y Zona.
- **Fase 2: PREVENTA de Arte y Presentación del Proyecto (Meses 4-6)**
  - Evento 1: Lanzamiento oficial y presentación del Universo.
  - Evento 2: Workshop de creación y colaboración.
  - Evento 3: Exhibición de propuestas y subasta de arte.
  - Evento 4: Conferencia sobre futuro y expansión del proyecto.
- **Fase 3: Desarrollo Continuo y Crecimiento de la Comunidad (Meses 7-12)**
  - Expansión del ecosistema.
  - Fortalecimiento de la comunidad.
- **Fase 4: Integración y Alianzas Estratégicas (Año 2)**
  - Colaboraciones con artistas y proyectos.
  - Expansión de Universos y Zonas.
- **Fase 5: Consolidación y Sostenibilidad a Largo Plazo (Año 3 en adelante)**
  - Innovación continua.
  - Impacto cultural y social.
  - Sostenibilidad económica.

## **Ventajas Competitivas**

### Innovación en el Mercado de Criptomonedas

ANGRY introduce el concepto de art-coins, aportando una solución innovadora a la volatilidad y falta de valor intrínseco de las meme-coins, y diferenciándose en un mercado saturado.

Patreons?

NFT como ventaja con arte digital?&#x20;

Integración de IA Generativa y Crypto?

Art Coins extrapolables a otro tipo de arte, no solo generativo?



### Valor Añadido a través del Arte

Al respaldar la moneda con arte generativo de IA, se añade un valor duradero y coleccionable, atrayendo tanto a inversores como a entusiastas del arte digital.

### Comunidad y Participación Activa

El modelo de ANGRY fomenta una comunidad participativa y creativa, donde los miembros pueden influir directamente en el desarrollo y éxito del proyecto.

Joseph Beyus?

## Conclusión

Angry Bunny (ANGRY) representa una evolución en el mundo de las criptomonedas y arte digital generativo, fusionando arte y tecnología para crear un activo sostenible y culturalmente relevante. Invitamos a inversores, artistas y entusiastas a unirse a este innovador proyecto y ser parte de una comunidad que redefine el valor en los mercados digitales.

## **Anexos**

- **Detalles Técnicos**
  - Especificaciones de los smart contracts.
  - Diagramas de flujo y arquitectura del sistema.
- **Preguntas Frecuentes**
  - Respuestas a dudas comunes sobre el proyecto y su funcionamiento.
- **Equipo y Colaboradores**
  - Presentación del equipo detrás de ANGRY y sus credenciales.
- **Referencias**
  - Enlaces a recursos adicionales y documentación relevante.

