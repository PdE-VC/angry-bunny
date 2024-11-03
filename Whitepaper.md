# Estructura Actualizada del Whitepaper de Angry Bunny (ANGRY):

## **Resumen Ejecutivo**

Angry Bunny (ANGRY) es una innovadora propuesta dentro del ecosistema de criptomonedas que introduce el concepto de art-coins, superando las limitaciones de las meme-coins tradicionales. Al respaldar su valor con arte generativo creado por inteligencia artificial (IA), ANGRY ofrece una alternativa sostenible y culturalmente relevante en los mercados digitales. Esta fusión entre criptomoneda y arte busca mitigar la volatilidad especulativa y aportar un valor intrínseco duradero a los inversores y participantes de la comunidad.

## **Introducción**

El mercado de criptomonedas ha experimentado un crecimiento explosivo, con la aparición de meme-coins que generan interés especulativo a corto plazo debido a su alta volatilidad. Sin embargo, estas carecen de valor intrínseco, lo que conduce a una pérdida significativa de valor con el tiempo. ANGRY aborda este desafío al introducir las art-coins, que incorporan arte generativo de IA, aportando un propósito artístico y cultural que preserva su relevancia financiera a largo plazo.

## **Concepto de Art-Coins**

Las art-coins son criptomonedas respaldadas por obras de arte generativas creadas mediante inteligencia artificial. A diferencia de las meme-coins, las art-coins ofrecen un valor intrínseco al estar asociadas con activos artísticos únicos y coleccionables. Esto combina la emoción y participación de la comunidad crypto con la apreciación y valor del arte digital, creando un activo más sostenible y menos propenso a la devaluación.

## **Ecosistema de Angry Bunny (ANGRY)**

### **Universo**

El Universo define el contexto estético y conceptual. Solo puede ser agregado por la Fundación Killcopyright, y se plantea que esto suceda en intervalos de al menos dos años.

### **Zonas**

Las Zonas son subespacios estéticos dentro del Universo, definidos exclusivamente por la Fundación. Son más específicas y mantienen coherencia con los lineamientos del Universo.

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

Las Propuestas de Arte son obras de arte generadas por la comunidad a través de IA basadas en los prompts del Área o nuevos prompts trabajados para cada propuesta. Para que el sistema automático de curaduría seleccione una Propuesta de Arte y la transforme en una Obra de Arte aceptada y validada por el sistema, se realiza un número específico de propuestas determinado por la *Difficulty*. Después, se lleva a cabo una curaduría automática por competencia para seleccionar una obra final, que se agrega al Área como un NFT definitivo.

Todas las propuestas deben pertenecer a un modelo generativo permitido y declarado en el Área, y deben presentarse con el prompt correspondiente para su validación. Esto asegura coherencia y calidad en el proceso creativo, y reconoce a los participantes como artistas activos del proyecto y la comunidad.

### Difficulty y tamaño de Área

La "difficulty" es un parámetro ajustado por la fundación para gestionar la rapidez con la que se llenan los pools de propuestas artísticas. Si el interés en el proyecto es alto y se generan muchas propuestas rápidamente, la dificultad aumenta. Esto asegura que haya un intervalo de tiempo constante, de aproximadamente 10 minutos, entre cada nueva obra seleccionada (es decir, cada "bloque minteado").

Este mecanismo es similar al concepto de dificultad en redes de blockchain como Bitcoin, donde la dificultad ajusta el tiempo de generación de bloques para mantener una red estable y segura. En el caso de ANGRY, se busca que el ritmo de selección de las obras de arte sea constante y no se vea afectado por un incremento abrupto en la cantidad de propuestas.

El tamaño de Área, es otro parámetro que va a ser ajustado por la Fundación con el mismo propósito dependiendo del interés circunstancial sobre el proyecto.

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

### Integridad del sistema

La integridad del sistema es un indicador definido por la Fundación, que refleja el grado de descentralización absoluta del proyecto. Se reconoce que alcanzar este nivel de descentralización es un proceso evolutivo y continuo, cuyo objetivo final es lograr un grado de integridad y descentralización del 100%. Inicialmente, ciertos componentes de la arquitectura se basan en nodos centralizados que, bajo el criterio de la Fundación, reducen la integridad del sistema, disminuyendo así la garantía de sostenibilidad y el mantenimiento a largo plazo del proyecto, junto con el resguardo del dominio público.

## **Economía del Token y Modelo de Incentivos**

### Detalles del Token ANGRY (ERC20)

- **Emisión y Distribución:** Las monedas ANGRY se emiten cada vez que se selecciona una Obra de Arte. La distribución es la siguiente:

  - 50% para unidades de colaboración (patreons) seleccionadas aleatoriamente.
  - 44% para el creador de la Obra de Arte (artista).
  - 3% para el creador del Área.
  - 3% (+ cualquier resto) para la Fundación.

- **Política de Emisión:** Cada vez que se minan 210,240 bloques, la recompensa otorgada por cada bloque se reduce a la mitad, hasta llegar a un límite. Esto crea un mecanismo de halving similar al de otras criptomonedas, controlando la inflación y aumentando la escasez con el tiempo. La cantidad de bloques antes de un halving fue calculada de tal forma que si se mantiene una emisión constante de validación de Obras de Arte (creación de bloque) cada 10 minutos, el halving suceda cada 4 años.

### Patreon Manager

**Art Patreons:**

Los Art Patreons son entidades o personas que apoyan financieramente al proyecto. Su participación es fundamental para el desarrollo del mismo, ya que, al colaborar, contribuyen a la sostenibilidad y expansión del proyecto. Reciben recompensas en forma de unidades de colaboración, lo cual les permite participar de manera más activa en el ecosistema del proyecto.

**Unidades de Colaboración (PTRN):**

Las unidades de colaboración son tokens emitidos por la Fundación, y representan la participación y la posibilidad de recibir recompensas dentro del proyecto. Estas unidades se emiten en cantidades limitadas y se distribuyen en fases al mismo tiempo que ocurre el halving de ANGRY. Estas fases reducen progresivamente la probabilidad de obtener recompensas, incentivando la entrada de nuevos participantes. Con cada fase, la cantidad de unidades emitidas aumenta linealmente, permitiendo un equilibrio entre la oferta de unidades y la entrada de nuevos colaboradores.

La Fundación es la propietaria inicial de estas unidades, pero no recibirá recompensas por poseerlas. Posteriormente, las venderá a los Art Patreons interesados en participar, lo que permite financiar las etapas del proyecto y recompensar a los fundadores.

Además, las unidades de colaboración pueden ser transferidas o vendidas, lo que agrega liquidez y valor a estas unidades, incentivando la inversión. La implementación técnica de las unidades de colaboración se basa en un ERC20 (PTRN) no divisible, lo que permite su comercialización fuera de la Fundación.

La cantidad máxima de unidades de colaboración será de 15,000, distribuidas de la siguiente manera:

- 1000 como emisión inicial.
- 1660 en el primer halving.
- 2758 en el segundo halving.
- 4582 en el tercer halving.

### Sostenibilidad Económica

El modelo económico de ANGRY está diseñado para ser sostenible a largo plazo, incentivando la participación activa en la creación y curaduría de arte, al mismo tiempo que controla la emisión de monedas y recompensa a los colaboradores clave del ecosistema.

## **Participación de la Comunidad**

### Artistas (Mineros)

Los Artistas son participantes que proponen Propuestas de Arte generativo dentro de un área. Si su propuesta es seleccionada, reciben una recompensa en ANGRY y contribuyen al acervo artístico del proyecto.

### Curadores de Arte

La curaduría está automatizada por IA, pero los participantes influyen en el proceso a través de la creación de propuestas de alta calidad y coherentes con el Universo, Zona y Área correspondientes. Mientras mayor calidad tengan estas obras de arte, mayor calidad tendrá el acervo del proyecto ya que hay una relación directa entre la calidad de las obras propuestas y la obras seleccionadas. Esto asegura una descentralización efectiva y participación comunitaria en la construcción del acervo.

### Colaboradores y Mesenas

Los Colaboradores pueden contribuir financieramente como Art Patreons, obteniendo unidades de colaboración y participando en las emisiones de la moneda. Esto fomenta una comunidad activa y comprometida con el crecimiento y éxito del proyecto.

## **Visión y Desarrollo Futuro**

### Expansión de Universos y Zonas

La Fundación planea agregar nuevos Universos y Zonas en intervalos definidos, enriqueciendo el ecosistema y ofreciendo nuevas oportunidades creativas y de inversión. Se estima que la duración de cada Universo será de 4 años mientras que las zonas estarán abiertas durante toda la duración del Universo correspondiente. Estos intervalos no serán fijados y quedan sujetos a la posibilidad y consideración estratégica de la Fundación.

### Convergencia entre Tecnología y Arte

ANGRY continuará innovando en la integración de IA y blockchain, explorando nuevas formas de generar y curar arte digital, y potenciando la colaboración con artistas y tecnólogos.

### Impacto Cultural

El proyecto busca influir positivamente en el arte digital, promoviendo la creación colectiva y de dominio público y el valor del arte generativo como activo financiero y cultural.

## Conclusión

Angry Bunny (ANGRY) emerge como un proyecto profundamente innovador que redefine la convergencia entre el arte y la tecnología, dejando una huella significativa en el ámbito cultural a través del uso de la inteligencia artificial. En el corazón de esta propuesta se encuentra el concepto de art-coins, una evolución de las criptomonedas que vincula directamente el valor digital con la creación artística generada por IA. A diferencia de los enfoques especulativos tradicionales, las art-coins ofrecen un propósito y un valor intrínseco, ya que cada unidad de valor está respaldada por obras artísticas únicas y cuidadosamente curadas. Este modelo no solo protege el valor artístico, sino que también promueve una conexión más profunda entre los participantes y la producción creativa, transformando la relación entre tecnología y arte.

La participación de los Art Patreons es fundamental para este ecosistema. A través de su apoyo, los Patreons impulsan la creación de un acervo artístico de dominio público, contribuyendo a la sostenibilidad y expansión del proyecto. Este sistema de colaboración fomenta una comunidad vibrante y comprometida, donde el mecenazgo tradicional se actualiza y se entrelaza con la innovación tecnológica. De este modo, ANGRY logra fortalecer la red creativa en torno a la idea de que el arte generativo puede ser tanto un bien cultural como un activo de valor perdurable, sin caer en dinámicas de especulación vacía.

El concepto de art-coins va más allá de su aplicación inicial en ANGRY. Si bien el proyecto se centra en obras generadas por IA, la estructura de las art-coins es lo suficientemente versátil como para respaldar otros tipos de manifestaciones artísticas. Esto significa que, en teoría, las art-coins pueden ser utilizadas en el futuro para vincularse con otros formatos artísticos, como la música digital, la fotografía, o cualquier otro tipo de obra creativa. Este potencial destaca la capacidad de las art-coins para actuar como un puente entre diversas formas de arte y la tecnología, asegurando que el valor cultural se mantenga relevante en un mundo en constante transformación.

En ANGRY, la inteligencia artificial juega un papel clave en la creación y curaduría de las obras de arte. Los modelos generativos permiten la producción de piezas que son estéticamente coherentes y culturalmente significativas, mientras que los procesos automatizados aseguran que la selección de las obras sea objetiva y basada en criterios de calidad, innovación y diversidad. Este enfoque no solo optimiza la creación artística, sino que también democratiza el acceso, ya que cualquier miembro de la comunidad puede contribuir con propuestas que serán evaluadas de manera transparente.

En resumen, Angry Bunny redefine cómo se entiende y valora el arte en la era tecnológica, proponiendo un modelo donde las art-coins se convierten en un vehículo para preservar y ampliar el impacto cultural del arte digital. La fusión de tecnología avanzada y creatividad no solo expande los límites de lo que es posible en el arte, sino que también ofrece un marco para que el arte generativo y las nuevas formas de expresión cultural sigan evolucionando. Con ANGRY, el arte y la tecnología se unen de manera profunda, creando un legado duradero donde el valor artístico se amplifica y transforma en un recurso colectivo y accesible para todos.
